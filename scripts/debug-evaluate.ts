import { prisma } from "../src/lib/prisma";
import { evaluateAnswer } from "../src/lib/ai/AnswerEvaluationService";

async function main() {
  const interview = await prisma.interview.findFirst({
    where: { status: "COMPLETED", report: null },
    include: {
      questions: {
        include: { answer: true },
      },
      report: true,
    },
  });

  if (!interview) {
    console.log("No completed interview without report found.");
    return;
  }

  console.log("Evaluating interview:", interview.id);

  try {
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
        console.log(`Skipping question ${q.id} - no valid answer`);
        continue; 
      }

      console.log(`Evaluating answer for question: ${q.question}`);

      // Check if evaluation already exists to avoid re-evaluating on partial failures
      const existingEval = await prisma.interviewEvaluation.findUnique({
        where: { answerId: q.answer.id }
      });

      let evaluationData;

      if (existingEval) {
        console.log(`Found existing evaluation for answer: ${q.answer.id}`);
        evaluationData = existingEval;
      } else {
        const result = await evaluateAnswer({
          role: interview.role,
          experienceLevel: interview.experienceLevel,
          interviewType: interview.interviewType,
          difficulty: interview.difficulty,
          question: q.question,
          category: q.category,
          answerText: q.answer.answerText,
        });

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
        console.log(`Created new evaluation for answer: ${q.answer.id}`);
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

    const safeDiv = (total: number) => validAnswers > 0 ? Math.round(total / validAnswers) : 0;

    const finalTech = safeDiv(totalTech);
    const finalComm = safeDiv(totalComm);
    const finalClarity = safeDiv(totalClarity);
    const finalConf = safeDiv(totalConf);
    const finalRel = safeDiv(totalRel);
    const finalGram = safeDiv(totalGram);
    const finalOverall = safeDiv(totalOverall);

    const readinessScore = validAnswers > 0 ? Math.round((finalOverall * 0.7) + (finalConf * 0.3)) : 0;

    const uniqueStrengths = Array.from(new Set(globalStrengths)).slice(0, 5);
    const uniqueWeaknesses = Array.from(new Set(globalWeaknesses)).slice(0, 5);
    const uniqueImprovements = Array.from(new Set(globalSuggestions)).slice(0, 5);

    console.log("Creating report with data:", {
      interviewId: interview.id,
      overallScore: finalOverall,
      readinessScore,
      // ...
    });

    await prisma.interviewReport.create({
      data: {
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

    console.log("Successfully evaluated and created report!");

  } catch (error: any) {
    console.error("Evaluation Failed!");
    if (error.issues) {
      console.error("Zod Validation Issues:", JSON.stringify(error.issues, null, 2));
    } else {
      console.error("Error:", error);
    }
  }
}

main().finally(() => prisma.$disconnect());
