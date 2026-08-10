import { prisma } from "../prisma";
import { generateText, extractJsonFromResponse } from "./OpenRouterClient";

export type CoachAnalysis = {
  overallScore: number | null;
  trend: number | null;
  totalInterviews: number;
  totalQuestions: number;
  strongestArea: { name: string; score: number } | null;
  weakestArea: { name: string; score: number } | null;
  skillBreakdown: { name: string; score: number; trend: number | null; evaluations: number }[];
  repeatedPatterns: string[];
  coachingSummary: string;
  recommendations: {
    focusArea: string;
    reason: string;
  } | null;
  weeklyPlan: {
    day: string;
    focus: string;
    activity: string;
  }[];
  readiness: string;
};

const COACH_PROMPT = `You are InterviewAI's Personal AI Coach. Your job is to analyze the candidate's deterministic performance metrics and provide actionable coaching.
Output JSON only with this structure:
{
  "coachingSummary": "A concise paragraph summarizing their performance and progress.",
  "repeatedPatterns": ["Pattern 1 (e.g. Answers are too long)", "Pattern 2", ... (max 3)],
  "recommendationReason": "Short explanation of why they should practice their weakest area.",
  "weeklyPlan": [
    { "day": "Day 1", "focus": "Communication", "activity": "10 questions / 15 min" },
    ... (exactly 5 days)
  ],
  "readiness": "A short summary of their interview readiness."
}

Do NOT invent fake metrics. Base your analysis completely on the provided candidate data.`;

export class PersonalCoachService {
  static async getCoachingData(userId: string): Promise<CoachAnalysis> {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: { user: { select: { resumes: { take: 1, orderBy: { uploadedAt: "desc" } } } } },
    });

    if (!profile) throw new Error("Profile not found");

    const interviews = await prisma.interview.findMany({
      where: { userId, status: "COMPLETED", report: { isNot: null } },
      include: {
        report: true,
        questions: {
          include: {
            answer: {
              include: { evaluation: true },
            },
          },
        },
      },
      orderBy: { completedAt: "desc" },
    });

    const practiceAttempts = await prisma.practiceAttempt.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
    });

    const totalInterviews = interviews.length;
    let totalQuestions = practiceAttempts.length;
    let latestActivityDate = profile.createdAt;

    interviews.forEach(i => {
      totalQuestions += i.questions.filter(q => q.answer).length;
      if (i.completedAt && i.completedAt > latestActivityDate) {
        latestActivityDate = i.completedAt;
      }
    });

    practiceAttempts.forEach(p => {
      if (p.completedAt && p.completedAt > latestActivityDate) {
        latestActivityDate = p.completedAt;
      }
    });

    // Check cache
    if (
      profile.coachAnalysis &&
      profile.coachAnalysisUpdatedAt &&
      profile.coachAnalysisUpdatedAt >= latestActivityDate
    ) {
      return profile.coachAnalysis as unknown as CoachAnalysis;
    }

    if (totalInterviews === 0) {
      // Empty state
      const emptyState: CoachAnalysis = {
        overallScore: null,
        trend: null,
        totalInterviews: 0,
        totalQuestions,
        strongestArea: null,
        weakestArea: null,
        skillBreakdown: [],
        repeatedPatterns: [],
        coachingSummary: "Complete your first interview and I'll start learning your performance.",
        recommendations: null,
        weeklyPlan: [],
        readiness: "Not enough data yet.",
      };
      return emptyState;
    }

    // Calculate deterministic metrics
    const reports = interviews.map(i => i.report!).reverse(); // chronological
    
    const avg = (nums: number[]) => nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null;
    
    const overallScore = avg(reports.map(r => r.overallScore));
    let trend: number | null = null;
    if (reports.length >= 2) {
      trend = reports[reports.length - 1].overallScore - reports[reports.length - 2].overallScore;
    }

    const skillsData = {
      Technical: { scores: [] as number[], prevScores: [] as number[] },
      Communication: { scores: [] as number[], prevScores: [] as number[] },
      Confidence: { scores: [] as number[], prevScores: [] as number[] },
      Relevance: { scores: [] as number[], prevScores: [] as number[] },
    };

    // Split into previous and recent for trends
    const splitIndex = Math.max(1, Math.floor(reports.length / 2));
    const previousReports = reports.slice(0, splitIndex);
    const recentReports = reports.slice(splitIndex);

    const pushScores = (src: typeof reports, dest: "scores" | "prevScores") => {
      src.forEach(r => {
        skillsData.Technical[dest].push(r.technicalScore);
        skillsData.Communication[dest].push(r.communicationScore);
        skillsData.Confidence[dest].push(r.confidenceScore);
        skillsData.Relevance[dest].push(r.relevanceScore);
      });
    };
    
    pushScores(recentReports.length ? recentReports : previousReports, "scores");
    if (recentReports.length) pushScores(previousReports, "prevScores");

    const skillBreakdown = Object.entries(skillsData).map(([name, data]) => {
      const score = avg(data.scores) ?? 0;
      const prevScore = avg(data.prevScores);
      const skillTrend = prevScore !== null ? score - prevScore : null;
      return {
        name,
        score,
        trend: skillTrend,
        evaluations: data.scores.length + data.prevScores.length,
      };
    });

    let strongestArea = null;
    let weakestArea = null;
    
    if (skillBreakdown.length > 0) {
      strongestArea = skillBreakdown.reduce((prev, curr) => (curr.score > prev.score ? curr : prev));
      weakestArea = skillBreakdown.reduce((prev, curr) => (curr.score < prev.score ? curr : prev));
    }

    // Aggregate recent weaknesses
    const allWeaknesses: string[] = [];
    interviews.slice(0, 3).forEach(i => {
      i.questions.forEach(q => {
        if (q.answer?.evaluation?.weaknesses) {
          const w = q.answer.evaluation.weaknesses as any;
          if (Array.isArray(w)) allWeaknesses.push(...w);
        }
      });
    });

    const candidateData = {
      overallScore,
      trend,
      targetRole: profile.targetRole,
      targetCompany: profile.targetCompany,
      strongestArea,
      weakestArea,
      recentWeaknesses: allWeaknesses.slice(0, 15), // prevent context bloat
    };

    let aiResult: any = {};
    let usingFallback = false;

    try {
      console.log(`[CoachService] Fetching OpenRouter AI insights for ${userId}`);
      const aiResponse = await generateText({
        systemPrompt: COACH_PROMPT,
        userPrompt: `Candidate Data:\n${JSON.stringify(candidateData, null, 2)}\n\nGenerate the JSON coaching response based on this data.`,
        temperature: 0.7,
        maxTokens: 600,
        responseFormat: { type: "json_object" },
      });

      aiResult = extractJsonFromResponse(aiResponse);
      console.log(`[CoachService] Successfully parsed AI insights for ${userId}`);
    } catch (error: any) {
      console.error("[CoachService] AI Generation failed, using fallback:", error.message);
      usingFallback = true;
      
      // Deterministic Fallback
      aiResult = {
        coachingSummary: `Based on your recent performance, your overall score is ${overallScore}%. ${strongestArea ? `You excel in ${strongestArea.name}.` : ""} ${weakestArea ? `We recommend focusing your practice on ${weakestArea.name} next.` : "Keep practicing to refine your skills."}`,
        repeatedPatterns: [],
        recommendationReason: weakestArea ? `Your recent ${weakestArea.name} score indicates a clear opportunity for improvement.` : "Practice makes perfect.",
        weeklyPlan: [],
        readiness: "Data analysis complete."
      };
    }

    const finalAnalysis: CoachAnalysis = {
      overallScore,
      trend,
      totalInterviews,
      totalQuestions,
      strongestArea: strongestArea ? { name: strongestArea.name, score: strongestArea.score } : null,
      weakestArea: weakestArea ? { name: weakestArea.name, score: weakestArea.score } : null,
      skillBreakdown,
      repeatedPatterns: aiResult.repeatedPatterns || [],
      coachingSummary: aiResult.coachingSummary || "Keep practicing to improve your skills.",
      recommendations: weakestArea ? {
        focusArea: weakestArea.name,
        reason: aiResult.recommendationReason || `Your recent ${weakestArea.name} score indicates an opportunity for improvement.`,
      } : null,
      weeklyPlan: aiResult.weeklyPlan || [],
      readiness: aiResult.readiness || "Getting there.",
    };

    // Update Cache
    // Do not cache a fallback response so it can retry later, unless you want to cache it temporarily.
    // I will cache it but with the current timestamp so it doesn't try constantly, or I'll just not update the cache if it failed.
    if (!usingFallback) {
      console.log(`[CoachService] Updating cache for ${userId}`);
      await prisma.profile.update({
        where: { userId },
        data: {
          coachAnalysis: finalAnalysis as any,
          coachAnalysisUpdatedAt: new Date(),
        },
      });
    } else {
      console.log(`[CoachService] Skipping cache update for ${userId} due to fallback usage.`);
    }

    return finalAnalysis;
  }
}
