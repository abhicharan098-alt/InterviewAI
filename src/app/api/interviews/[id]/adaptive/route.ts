import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { decideAdaptiveNextStep } from "@/lib/ai/AdaptiveInterviewService";

const AdaptiveRequestSchema = z.object({
  questionId: z.string().uuid(),
  answer: z.string(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await req.json();
    const data = AdaptiveRequestSchema.parse(body);

    /* 1. Fetch interview with all questions & answers */
    const interview = await prisma.interview.findUnique({
      where: { id, userId },
      include: {
        questions: {
          orderBy: [
            { questionNumber: "asc" },
            { createdAt: "asc" },
          ],
          include: { answer: true },
        },
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    if (interview.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Interview is not in progress" }, { status: 400 });
    }

    /* 2. Locate target question */
    const currentQuestion = interview.questions.find((q) => q.id === data.questionId);
    if (!currentQuestion) {
      return NextResponse.json(
        { error: "Question does not belong to this interview" },
        { status: 400 }
      );
    }

    /* 3. Check for existing follow-up for duplicate protection */
    const existingFollowUp = interview.questions.find(
      (q) => q.parentQuestionId === currentQuestion.id
    );

    if (existingFollowUp) {
      return NextResponse.json({
        action: "FOLLOW_UP",
        question: {
          id: existingFollowUp.id,
          questionNumber: existingFollowUp.questionNumber,
          question: existingFollowUp.question,
          category: existingFollowUp.category,
          difficulty: existingFollowUp.difficulty,
          isFollowUp: true,
          topic: existingFollowUp.topic || "general",
        },
      });
    }

    /* 4. Fetch resume context */
    const resume = await prisma.resume.findFirst({
      where: { userId, status: "PARSED" },
      orderBy: { uploadedAt: "desc" },
    });

    let resumeText = "";
    if (resume?.parsedData && typeof resume.parsedData === "object") {
      const p = resume.parsedData as any;
      resumeText = `Candidate Name: ${p.name || "Candidate"}\nSummary: ${
        p.summary || "N/A"
      }\nSkills: ${(p.skills || []).join(", ")}`;
    } else if (resume?.rawText) {
      resumeText = resume.rawText.slice(0, 1500);
    }

    /* 5. Calculate follow-up depth for current base question chain */
    let followUpCountForCurrentBase = 0;
    if (currentQuestion.isFollowUp) {
      followUpCountForCurrentBase = currentQuestion.followUpDepth || 1;
    }

    /* 6. Calculate time remaining */
    let timeRemainingSeconds: number | null = null;
    let totalDurationSeconds: number | null = interview.durationMinutes * 60;
    if (interview.startedAt) {
      const startedAtMs = new Date(interview.startedAt).getTime();
      const endsAtMs = startedAtMs + interview.durationMinutes * 60 * 1000;
      timeRemainingSeconds = Math.max(0, Math.floor((endsAtMs - Date.now()) / 1000));
    }

    /* 7. Build previous Q&A context */
    const previousQA = interview.questions
      .filter((q) => q.answer && q.answer.answerText)
      .map((q) => ({
        question: q.question,
        answer: q.answer!.answerText || "",
        isFollowUp: q.isFollowUp,
        topic: q.topic || q.category,
      }));

    /* 7.5. Question Count Guard */
    // Note: The previousQA array includes all questions that have an answer.
    // If the user just answered this question, it is ALREADY included in previousQA because we fetch all questions & answers from DB.
    const answeredCount = previousQA.length;
    
    if (answeredCount >= interview.questionCount) {
      return NextResponse.json({
        action: "NEXT_TOPIC",
        question: null,
      });
    }

    /* 8. Call Adaptive AI Service */
    const decision = await decideAdaptiveNextStep({
      role: interview.role,
      experienceLevel: interview.experienceLevel,
      interviewType: interview.interviewType,
      difficulty: interview.difficulty,
      resumeContext: resumeText,
      currentQuestion: currentQuestion.question,
      currentQuestionTopic: currentQuestion.topic || currentQuestion.category,
      candidateAnswer: data.answer,
      previousQuestionsAnswers: previousQA,
      followUpCountForCurrentBase,
      timeRemainingSeconds,
      totalDurationSeconds,
      configuredQuestionCount: interview.questionCount,
      focusAreas: interview.focusAreas,
    });

    /* 9. If action is FOLLOW_UP, persist question into database */
    if (decision.action === "FOLLOW_UP" && decision.question && decision.question.trim().length >= 5) {
      // Find the last unanswered question to remove, maintaining the strict count limit
      // It must not be the current question. We don't care if it's original or follow-up, just that it's unanswered.
      const lastUnanswered = [...interview.questions].reverse().find(
        (q) => !q.answer && q.id !== currentQuestion.id
      );

      if (!lastUnanswered) {
        // Strict limit guard: if there are no unanswered questions left to replace, we CANNOT add a follow-up.
        return NextResponse.json({
          action: "NEXT_TOPIC",
          question: null,
        });
      }

      const [newFollowUp] = await prisma.$transaction([
        prisma.interviewQuestion.create({
          data: {
            interviewId: interview.id,
            questionNumber: currentQuestion.questionNumber, // Same base question number sequence
            question: decision.question.trim(),
            category: currentQuestion.category,
            difficulty: decision.difficulty,
            isFollowUp: true,
            parentQuestionId: currentQuestion.id,
            topic: decision.topic || currentQuestion.category,
            followUpDepth: (currentQuestion.followUpDepth || 0) + 1,
          },
        }),
        prisma.interviewQuestion.delete({ where: { id: lastUnanswered.id } }),
      ]);

      return NextResponse.json({
        action: "FOLLOW_UP",
        question: {
          id: newFollowUp.id,
          questionNumber: newFollowUp.questionNumber,
          question: newFollowUp.question,
          category: newFollowUp.category,
          difficulty: newFollowUp.difficulty,
          isFollowUp: true,
          topic: newFollowUp.topic,
        },
      });
    }

    /* 10. Otherwise, action is NEXT_TOPIC */
    return NextResponse.json({
      action: "NEXT_TOPIC",
      question: null,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as z.ZodError).issues }, { status: 400 });
    }
    console.error("Adaptive API Error (safely falling back to NEXT_TOPIC):", error);
    // Return NEXT_TOPIC fallback so client handles error gracefully without breaking interview
    return NextResponse.json({
      action: "NEXT_TOPIC",
      question: null,
    });
  }
}
