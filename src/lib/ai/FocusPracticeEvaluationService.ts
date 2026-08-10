import { z } from "zod";
import { generateText, extractJsonFromResponse } from "./OpenRouterClient";

export const FocusEvaluationSchema = z.object({
  score: z.number().min(0).max(100),
  strength: z.string(),
  weakness: z.string(),
  suggestion: z.string(),
});

export type FocusEvaluation = z.infer<typeof FocusEvaluationSchema>;

export class FocusPracticeEvaluationService {
  static async evaluateAnswer(
    question: string,
    answer: string,
    focusArea: string
  ): Promise<FocusEvaluation> {
    if (!answer || answer.trim() === "[SKIPPED]" || answer.trim().length === 0) {
      return {
        score: 0,
        strength: "None.",
        weakness: "The question was skipped.",
        suggestion: "Try to answer every question, even if you are unsure.",
      };
    }

    const systemPrompt = `You are an expert technical and behavioral interviewer evaluating a candidate's answer.
The question was designed specifically to test the candidate's skill in: "${focusArea}".

Question: "${question}"
Candidate's Answer: "${answer}"

Evaluate the candidate's answer based ONLY on how well they demonstrated the "${focusArea}" skill.

Return your evaluation as a JSON object matching this exact schema. Do NOT wrap in markdown code blocks (\`\`\`json). Return pure JSON.
{
  "score": number, // 0-100 representing how well they demonstrated the skill
  "strength": string, // A 1-sentence specific strength in their answer regarding this skill
  "weakness": string, // A 1-sentence specific area of improvement regarding this skill
  "suggestion": string // A 1-sentence actionable tip to improve this skill
}

Be realistic and strict. Do not artificially inflate scores.`;

    try {
      const response = await generateText({
        systemPrompt,
        userPrompt: "Please evaluate the candidate's answer.",
        maxTokens: 300,
        temperature: 0.7,
        responseFormat: { type: "json_object" }
      });
      
      const parsed = extractJsonFromResponse(response);
      return FocusEvaluationSchema.parse(parsed);
    } catch (error) {
      console.error("Focus Practice Evaluation Error:", error);
      return {
        score: 50,
        strength: "Answer recorded.",
        weakness: "Could not perform detailed evaluation.",
        suggestion: "Continue practicing.",
      };
    }
  }
}
