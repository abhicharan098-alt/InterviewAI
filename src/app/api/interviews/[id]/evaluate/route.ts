import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { evaluateAnswer } from "@/lib/ai/AnswerEvaluationService";
import { NotificationService } from "@/lib/notifications/NotificationService";
import { calculateStreak, STREAK_MILESTONES } from "@/lib/notifications/streaks";
import { checkAchievements } from "@/lib/notifications/achievements";

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

    const interview = await prisma.interview.findUnique({
      where: { id, userId: session.user.id },
      include: {
        questions: {
          include: { answer: true },
        },
        report: true,
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    if (interview.status !== "COMPLETED") {
      return NextResponse.json({ error: "Interview must be completed before evaluation" }, { status: 400 });
    }

    if (interview.report) {
      return NextResponse.json({ success: true, message: "Already evaluated" });
    }

    let totalTech = 0, totalComm = 0, totalClarity = 0, totalConf = 0;
    let totalRel = 0, totalGram = 0, totalOverall = 0;
    let validAnswers = 0;
    
    const globalStrengths: string[] = [];
    const globalWeaknesses: string[] = [];
    const globalSuggestions: string[] = [];

    // Evaluate each answer
    const evaluations = [];
    for (const q of interview.questions) {
      if (!q.answer || !q.answer.answerText || q.answer.answerText === "[SKIPPED]") {
        continue; // Skip evaluating empty or skipped questions
      }

      // Check if evaluation already exists to avoid re-evaluating on partial failures
      const existingEval = await prisma.interviewEvaluation.findUnique({
        where: { answerId: q.answer.id }
      });

      let evaluationData;

      if (existingEval) {
        evaluationData = existingEval;
      } else {
        // Duplicate check against previous questions
        const currentAnswerText = q.answer.answerText.trim().toLowerCase();
        const previousAnswers = interview.questions
          .filter(prevQ => prevQ.questionNumber < q.questionNumber && prevQ.answer && prevQ.answer.answerText && prevQ.answer.answerText !== "[SKIPPED]")
          .map(prevQ => prevQ.answer!.answerText!.trim().toLowerCase());
          
        const isDuplicate = previousAnswers.some(prev => 
          (prev === currentAnswerText && currentAnswerText.length > 10) || 
          (prev.length > 30 && currentAnswerText.length > 30 && (currentAnswerText.includes(prev) || prev.includes(currentAnswerText)))
        );

        if (isDuplicate) {
          try {
            evaluationData = await prisma.interviewEvaluation.create({
              data: {
                answerId: q.answer.id,
                technicalScore: 0,
                communicationScore: 0,
                clarityScore: 0,
                confidenceScore: 0,
                relevanceScore: 0,
                grammarScore: 0,
                overallScore: 0,
                strengths: ["None."],
                weaknesses: ["The answer provided was completely irrelevant or addressed a different question entirely."],
                suggestions: ["Ensure you are listening to the specific question asked and responding directly to it, rather than reusing previous answers."],
                idealAnswer: "N/A - Answer was a duplicate.",
              }
            });
          } catch (createError: any) {
            if (createError instanceof Prisma.PrismaClientKnownRequestError && createError.code === 'P2002') {
              const reFetched = await prisma.interviewEvaluation.findUnique({
                where: { answerId: q.answer.id }
              });
              if (reFetched) {
                evaluationData = reFetched;
              } else {
                throw createError;
              }
            } else {
              throw createError;
            }
          }
        } else {
          const result = await evaluateAnswer({
          role: interview.role,
          experienceLevel: interview.experienceLevel,
          interviewType: interview.interviewType,
          difficulty: interview.difficulty,
          question: q.question,
          category: q.category,
          answerText: q.answer.answerText,
          focusAreas: interview.focusAreas,
        });

        try {
          evaluationData = await prisma.interviewEvaluation.create({
            data: {
              answerId: q.answer.id,
              technicalScore: result.technicalScore,
              communicationScore: result.communicationScore,
              clarityScore: result.clarityScore,
              confidenceScore: result.confidenceScore,
              relevanceScore: result.relevanceScore,
              grammarScore: result.grammarScore,
              overallScore: result.overallScore,
              strengths: result.strengths,
              weaknesses: result.weaknesses,
              suggestions: result.suggestions,
              idealAnswer: result.idealAnswer,
            }
          });
        } catch (createError: any) {
          // If a concurrent request created the evaluation precisely between our findUnique and create
          if (createError instanceof Prisma.PrismaClientKnownRequestError && createError.code === 'P2002') {
            const reFetched = await prisma.interviewEvaluation.findUnique({
              where: { answerId: q.answer.id }
            });
            if (reFetched) {
              evaluationData = reFetched;
            } else {
              throw createError;
            }
          } else {
            throw createError;
          }
        }
        }
      }

      totalTech += evaluationData.technicalScore;
      totalComm += evaluationData.communicationScore;
      totalClarity += evaluationData.clarityScore;
      totalConf += evaluationData.confidenceScore;
      totalRel += evaluationData.relevanceScore;
      totalGram += evaluationData.grammarScore;
      totalOverall += evaluationData.overallScore;
      
      if (evaluationData.strengths) globalStrengths.push(...(evaluationData.strengths as string[]));
      if (evaluationData.weaknesses) globalWeaknesses.push(...(evaluationData.weaknesses as string[]));
      if (evaluationData.suggestions) globalSuggestions.push(...(evaluationData.suggestions as string[]));
      
      validAnswers++;
    }

    if (validAnswers === 0) {
      return NextResponse.json({
        success: true,
        message: "No valid answers to evaluate. Report not created.",
      });
    }

    const safeDiv = (total: number) => Math.round(total / validAnswers);

    const finalTech = safeDiv(totalTech);
    const finalComm = safeDiv(totalComm);
    const finalClarity = safeDiv(totalClarity);
    const finalConf = safeDiv(totalConf);
    const finalRel = safeDiv(totalRel);
    const finalGram = safeDiv(totalGram);
    const finalOverall = safeDiv(totalOverall);

    // Readiness score combines overall performance and confidence
    const readinessScore = validAnswers > 0 ? Math.round((finalOverall * 0.7) + (finalConf * 0.3)) : 0;

    // Deduplicate lists and slice to top 5
    const uniqueStrengths = Array.from(new Set(globalStrengths)).slice(0, 5);
    const uniqueWeaknesses = Array.from(new Set(globalWeaknesses)).slice(0, 5);
    const uniqueImprovements = Array.from(new Set(globalSuggestions)).slice(0, 5);

    // Create or Update Report
    await prisma.interviewReport.upsert({
      where: {
        interviewId: interview.id
      },
      update: {
        overallScore: finalOverall,
        technicalScore: finalTech,
        communicationScore: finalComm,
        clarityScore: finalClarity,
        confidenceScore: finalConf,
        relevanceScore: finalRel,
        grammarScore: finalGram,
        problemSolvingScore: finalTech, // Mapped to tech for now
        readinessScore: readinessScore,
        strengths: uniqueStrengths,
        weaknesses: uniqueWeaknesses,
        improvements: uniqueImprovements,
      },
      create: {
        interviewId: interview.id,
        overallScore: finalOverall,
        technicalScore: finalTech,
        communicationScore: finalComm,
        clarityScore: finalClarity,
        confidenceScore: finalConf,
        relevanceScore: finalRel,
        grammarScore: finalGram,
        problemSolvingScore: finalTech, // Mapped to tech for now
        readinessScore: readinessScore,
        strengths: uniqueStrengths,
        weaknesses: uniqueWeaknesses,
        improvements: uniqueImprovements,
        learningPlan: [],
      }
    });

    // ── Fire notifications (non-blocking) ──────────────────────────────────
    try {
      const settings = await NotificationService.getSettings(session.user.id);

      // 1. INTERVIEW_RESULT
      if (settings.notifyResult) {
        const alreadyResult = await NotificationService.isDuplicate(session.user.id, 'INTERVIEW_RESULT', interview.id);
        if (!alreadyResult) {
          const isFocus = interview.interviewType === 'FOCUS_PRACTICE';
          await NotificationService.create(
            session.user.id, 'INTERVIEW_RESULT',
            'Interview Result Ready 📊',
            `Your ${interview.role} ${isFocus ? 'Focus Practice' : 'interview'} report is ready to review.`,
            { actionUrl: `/interview/${interview.id}/result`, relatedId: interview.id }
          );
        }
      }

      // 2. PERSONAL_BEST
      const previousBestRecord = await prisma.interviewReport.findFirst({
        where: { interview: { userId: session.user.id, status: 'COMPLETED', id: { not: interview.id } } },
        orderBy: { overallScore: 'desc' },
        select: { overallScore: true },
      });
      const prevBestScore = previousBestRecord?.overallScore ?? 0;

      if (settings.notifyPersonalBest && finalOverall > prevBestScore && prevBestScore > 0) {
        const alreadyBest = await NotificationService.isDuplicate(session.user.id, 'PERSONAL_BEST', interview.id);
        if (!alreadyBest) {
          await NotificationService.create(
            session.user.id, 'PERSONAL_BEST',
            'New Personal Best! ⭐',
            `You scored ${finalOverall}%, beating your previous best of ${prevBestScore}%. Excellent work!`,
            { actionUrl: `/interview/${interview.id}/result`, relatedId: interview.id }
          );
        }
      }

      // 3. PRACTICE_STREAK
      const streak = await calculateStreak(session.user.id, prisma);
      if (settings.notifyStreak) {
        for (const milestone of STREAK_MILESTONES) {
          if (streak >= milestone) {
            const alreadyStreak = await NotificationService.hasStreakMilestone(session.user.id, milestone);
            if (!alreadyStreak) {
              const msg = milestone >= 30
                ? `Incredible! A ${streak}-day practice streak! Your dedication is unmatched.`
                : milestone >= 14
                ? `You're on a ${streak}-day streak! Two weeks of consistent practice!`
                : milestone >= 7
                ? `7-day streak! 🔥 A full week of dedicated preparation.`
                : `You're on a ${streak}-day practice streak! Keep it up!`;
              await NotificationService.create(
                session.user.id, 'PRACTICE_STREAK',
                `Practice Streak 🔥`,
                msg,
                { actionUrl: '/dashboard', relatedId: `streak-${milestone}` }
              );
              break;
            }
          }
        }
      }

      // 4. ACHIEVEMENTS
      await checkAchievements(session.user.id, prisma, finalOverall, prevBestScore, streak);
    } catch (notifErr) {
      console.error('Notification trigger error (non-critical):', notifErr);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Interview Evaluation Error:", error);
    
    // Sanitize Prisma errors from frontend
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: "Evaluation could not be completed due to a database conflict. Please try again." }, 
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to process interview evaluation" }, 
      { status: 500 }
    );
  }
}
