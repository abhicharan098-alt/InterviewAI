import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
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
          include: {
            answer: {
              include: {
                evaluation: true,
              },
            },
          },
          orderBy: { questionNumber: "asc" },
        },
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Focus Practice session not found." }, { status: 404 });
    }

    if (interview.interviewType !== "FOCUS_PRACTICE") {
      return NextResponse.json({ error: "Invalid session type." }, { status: 400 });
    }

    // Filter out skipped or unanswered questions for scoring
    const answeredQuestions = interview.questions.filter(
      q => q.answer && q.answer.answerText !== "[SKIPPED]" && q.answer.evaluation
    );

    const questionsCount = answeredQuestions.length;
    let overallScore: number | null = null;
    const focusAreaStats: Record<string, { totalScore: number; count: number; score: number }> = {};
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const tips: string[] = [];

    // Initialize all selected focus areas with 0
    interview.focusAreas.forEach(area => {
      focusAreaStats[area] = { totalScore: 0, count: 0, score: 0 };
    });

    answeredQuestions.forEach((q) => {
      const evalData = q.answer!.evaluation!;
      const area = q.category || "General";
      
      // We stored the score identically in all fields in our next route, so we can just use overallScore
      const score = evalData.overallScore;

      overallScore = (overallScore || 0) + score;

      if (!focusAreaStats[area]) {
        focusAreaStats[area] = { totalScore: 0, count: 0, score: 0 };
      }
      focusAreaStats[area].totalScore += score;
      focusAreaStats[area].count += 1;

      if (evalData.strengths && typeof evalData.strengths === "string") strengths.push(evalData.strengths);
      if (evalData.weaknesses && typeof evalData.weaknesses === "string") weaknesses.push(evalData.weaknesses);
      if (evalData.suggestions && typeof evalData.suggestions === "string") tips.push(evalData.suggestions);
    });

    if (questionsCount > 0 && overallScore !== null) {
      overallScore = Math.round(overallScore / questionsCount);
    }

    // Calculate averages per area
    Object.keys(focusAreaStats).forEach(area => {
      const stat = focusAreaStats[area];
      if (stat.count > 0) {
        stat.score = Math.round(stat.totalScore / stat.count);
      }
    });

    let strongestArea: { name: string; score: number } | null = null;
    let weakestArea: { name: string; score: number } | null = null;
    let maxScore = -1;
    let minScore = 101;

    Object.entries(focusAreaStats).forEach(([area, stat]) => {
      if (stat.count > 0) {
        if (stat.score > maxScore) {
          maxScore = stat.score;
          strongestArea = { name: area, score: stat.score };
        }
        if (stat.score < minScore) {
          minScore = stat.score;
          weakestArea = { name: area, score: stat.score };
        }
      }
    });

    // Sample a few strengths/weaknesses to avoid overwhelming the user
    // We'll prioritize unique ones.
    const uniqueStrengths = Array.from(new Set(strengths)).slice(0, 3);
    const uniqueWeaknesses = Array.from(new Set(weaknesses)).slice(0, 3);
    const topTip = tips.length > 0 ? tips[tips.length - 1] : "Continue practicing to improve your skills.";

    return NextResponse.json({
      interview: {
        id: interview.id,
        status: interview.status,
        durationMinutes: interview.durationMinutes,
        focusAreas: interview.focusAreas,
      },
      report: {
        overallScore,
        questionsAnswered: questionsCount,
        questionsSkipped: interview.questions.length - questionsCount,
        focusAreasPracticed: Object.keys(focusAreaStats).filter(k => focusAreaStats[k].count > 0).length,
        focusAreaScores: focusAreaStats,
        strongestArea,
        weakestArea,
        feedback: {
          strengths: uniqueStrengths,
          weaknesses: uniqueWeaknesses,
          recommendedNextStep: weakestArea 
            ? `Focus on improving ${(weakestArea as any).name} in your next practice session. ${topTip}`
            : topTip,
        }
      },
      questions: interview.questions.map(q => ({
        id: q.id,
        number: q.questionNumber,
        category: q.category,
        question: q.question,
        answer: q.answer ? q.answer.answerText : null,
        evaluation: q.answer?.evaluation ? {
          score: q.answer.evaluation.overallScore,
          strength: q.answer.evaluation.strengths,
          weakness: q.answer.evaluation.weaknesses,
          suggestion: q.answer.evaluation.suggestions,
        } : null,
      })),
    });
  } catch (error: any) {
    console.error("Focus Practice Result Error:", error);
    return NextResponse.json({ error: "Failed to load report" }, { status: 500 });
  }
}
