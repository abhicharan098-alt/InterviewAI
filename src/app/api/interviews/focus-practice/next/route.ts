import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { FocusPracticeEvaluationService } from "@/lib/ai/FocusPracticeEvaluationService";
import { FocusPracticeQuestionGenerator } from "@/lib/ai/FocusPracticeQuestionGenerator";

const NextQuestionSchema = z.object({
  interviewId: z.string().uuid(),
  questionId: z.string().uuid(),
  answerText: z.string().optional().default(""),
  durationSec: z.number().default(0),
  skipped: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = NextQuestionSchema.parse(body);

    const interview = await prisma.interview.findUnique({
      where: { id: data.interviewId, userId: session.user.id },
      include: { 
        questions: {
          include: { answer: true }
        } 
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    const currentQuestion = interview.questions.find(q => q.id === data.questionId);
    if (!currentQuestion) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // 1. Save the Answer
    const finalAnswerText = data.skipped ? "[SKIPPED]" : data.answerText;
    const answer = await prisma.interviewAnswer.upsert({
      where: { questionId: currentQuestion.id },
      update: {
        answerText: finalAnswerText,
        durationSec: data.durationSec,
        submittedAt: new Date(),
      },
      create: {
        questionId: currentQuestion.id,
        answerText: finalAnswerText,
        durationSec: data.durationSec,
        submittedAt: new Date(),
      },
    });

    let evaluation = null;

    // 2. Evaluate the Answer if not skipped
    if (!data.skipped) {
      const previousAnswers = interview.questions
        .filter(q => q.id !== currentQuestion.id && q.answer && q.answer.answerText && q.answer.answerText !== "[SKIPPED]")
        .map(q => q.answer!.answerText!.trim().toLowerCase());
        
      const currentAnswerText = data.answerText.trim().toLowerCase();
      const isDuplicate = previousAnswers.some(prev => 
        (prev === currentAnswerText && currentAnswerText.length > 10) || 
        (prev.length > 30 && currentAnswerText.length > 30 && (currentAnswerText.includes(prev) || prev.includes(currentAnswerText)))
      );

      if (isDuplicate) {
        evaluation = {
          relevanceScore: 0,
          score: 0,
          strength: "None.",
          weakness: "You provided the exact same answer as a previous question.",
          suggestion: "Each question assesses a different skill. You must provide a unique, relevant answer for each question.",
        };
      } else {
        const targetFocusArea = currentQuestion.category || "General";
        evaluation = await FocusPracticeEvaluationService.evaluateAnswer(
          currentQuestion.question,
          data.answerText,
          targetFocusArea
        );
      }

      // Save Evaluation
      await prisma.interviewEvaluation.upsert({
        where: { answerId: answer.id },
        update: {
          technicalScore: evaluation.score,
          communicationScore: evaluation.score,
          clarityScore: evaluation.score,
          confidenceScore: evaluation.score,
          relevanceScore: evaluation.score,
          grammarScore: evaluation.score,
          overallScore: evaluation.score,
          strengths: evaluation.strength,
          weaknesses: evaluation.weakness,
          suggestions: evaluation.suggestion,
        },
        create: {
          answerId: answer.id,
          technicalScore: evaluation.score,
          communicationScore: evaluation.score,
          clarityScore: evaluation.score,
          confidenceScore: evaluation.score,
          relevanceScore: evaluation.score,
          grammarScore: evaluation.score,
          overallScore: evaluation.score,
          strengths: evaluation.strength,
          weaknesses: evaluation.weakness,
          suggestions: evaluation.suggestion,
        },
      });
    }

    // 3. Determine if session is complete
    const questionsAnswered = interview.questions.length;
    if (questionsAnswered >= interview.questionCount) {
      await prisma.interview.update({
        where: { id: interview.id },
        data: { status: "COMPLETED", completedAt: new Date() }
      });
      return NextResponse.json({ 
        success: true, 
        evaluation, 
        isComplete: true 
      });
    }

    // 4. Determine next focus area (Round robin for now based on answered count)
    const focusAreas = interview.focusAreas;
    const nextFocusArea = focusAreas[questionsAnswered % focusAreas.length];

    // 5. Generate next question
    const resume = await prisma.resume.findFirst({
      where: { userId: session.user.id, status: "PARSED" },
      orderBy: { uploadedAt: "desc" },
    });

    const previousQuestions = interview.questions.map(q => q.question);

    const nextQuestionText = await FocusPracticeQuestionGenerator.generateQuestion({
      targetFocusArea: nextFocusArea,
      role: interview.role,
      experienceLevel: interview.experienceLevel,
      resumeContext: resume?.parsedData ? JSON.stringify(resume.parsedData) : "",
      previousQuestions,
      lastQuestion: currentQuestion.question,
      lastAnswer: data.answerText,
    });

    const newQuestion = await prisma.interviewQuestion.create({
      data: {
        interviewId: interview.id,
        questionNumber: questionsAnswered + 1,
        question: nextQuestionText,
        category: nextFocusArea,
        difficulty: interview.difficulty,
        topic: nextFocusArea,
      },
    });

    return NextResponse.json({
      success: true,
      evaluation,
      isComplete: false,
      nextQuestion: newQuestion
    });

  } catch (error: any) {
    console.error("Focus Practice Next Route Error:", error);
    return NextResponse.json({ error: "Failed to process next step" }, { status: 500 });
  }
}
