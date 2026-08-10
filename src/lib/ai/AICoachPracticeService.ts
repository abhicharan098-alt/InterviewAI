import { PersonalCoachService } from "./PersonalCoachService";
import { generateText, extractJsonFromResponse } from "./OpenRouterClient";
import { Difficulty, InterviewType } from "@prisma/client";
import { prisma } from "../prisma";

export type AIPracticeConfig = {
  role: string;
  experienceLevel: string;
  interviewType: InterviewType;
  difficulty: Difficulty;
  focusAreas: string[];
  questionCategories: string[];
  reasoning: string;
};

const PRACTICE_PROMPT = `You are an AI Interview Coach generating a targeted practice interview configuration for a candidate.
Output ONLY valid JSON with this exact structure:
{
  "role": "Target job title",
  "interviewType": "TECHNICAL or BEHAVIORAL or MIXED",
  "difficulty": "EASY or MEDIUM or HARD",
  "focusAreas": ["Topic 1", "Topic 2", "Topic 3"],
  "questionCategories": ["Category 1", "Category 2"],
  "reasoning": "A short, encouraging explanation of why you selected this configuration."
}
Keep focus areas and categories relevant to their target role and specifically targeting their weaknesses.`;

export class AICoachPracticeService {
  static async generateTechnicalPractice(userId: string): Promise<AIPracticeConfig> {
    return this.generatePracticeConfig(userId, "TECHNICAL");
  }

  static async generateRecommendedPractice(userId: string): Promise<AIPracticeConfig> {
    return this.generatePracticeConfig(userId, "RECOMMENDED");
  }

  private static async generatePracticeConfig(userId: string, mode: "TECHNICAL" | "RECOMMENDED"): Promise<AIPracticeConfig> {
    const coachData = await PersonalCoachService.getCoachingData(userId);
    
    // Also fetch target role from profile to ensure we have it if coachData misses it
    const profile = await prisma.profile.findUnique({ where: { userId } });
    const targetRole = profile?.targetRole || "Software Engineer";

    const promptContext = {
      mode,
      targetRole,
      weakestArea: coachData.weakestArea?.name,
      strongestArea: coachData.strongestArea?.name,
      repeatedPatterns: coachData.repeatedPatterns,
      overallReadiness: coachData.overallScore,
    };

    let aiResult: any = {};
    let usingFallback = false;

    try {
      console.log(`[AICoachPracticeService] Fetching OpenRouter practice config for ${userId} in mode ${mode}`);
      const aiResponse = await generateText({
        systemPrompt: PRACTICE_PROMPT,
        userPrompt: `Generate a ${mode} practice configuration for this candidate:\n${JSON.stringify(promptContext, null, 2)}`,
        temperature: 0.7,
        maxTokens: 500,
        responseFormat: { type: "json_object" },
      });

      aiResult = extractJsonFromResponse(aiResponse);
      console.log(`[AICoachPracticeService] Successfully parsed practice config`);
    } catch (error: any) {
      console.error("[AICoachPracticeService] AI Config Generation failed, using fallback:", error.message);
      
      return {
        role: targetRole,
        experienceLevel: profile?.experienceLevel || "TWO_TO_FIVE",
        interviewType: mode === "TECHNICAL" ? "TECHNICAL" : "MIXED",
        difficulty: "MEDIUM",
        focusAreas: [coachData.weakestArea?.name || "General"],
        questionCategories: ["General"],
        reasoning: "We're focusing on your weakest area to help you improve quickly.",
      };
    }

    return {
      role: aiResult.role || targetRole,
      experienceLevel: aiResult.experienceLevel || profile?.experienceLevel || "TWO_TO_FIVE",
      interviewType: mode === "TECHNICAL" ? "TECHNICAL" : (aiResult.interviewType as InterviewType || "TECHNICAL"),
      difficulty: aiResult.difficulty as Difficulty || "MEDIUM",
      focusAreas: aiResult.focusAreas?.length ? aiResult.focusAreas : ["General"],
      questionCategories: aiResult.questionCategories?.length ? aiResult.questionCategories : ["General"],
      reasoning: aiResult.reasoning || "Generated based on your profile.",
    };
  }
}
