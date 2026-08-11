import { z } from "zod";
import { generateText, extractJsonFromResponse } from "./OpenRouterClient";

export const FocusEvaluationSchema = z.object({
  relevanceScore: z.number().min(0).max(100),
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
        relevanceScore: 0,
        score: 0,
        strength: "None.",
        weakness: "The question was skipped.",
        suggestion: "Try to answer every question, even if you are unsure.",
      };
    }

    const systemPrompt = `You are an expert technical and behavioral interviewer evaluating a candidate's answer.
The question was designed specifically to test the candidate's skill in: "${focusArea}".

Evaluate the candidate's answer based ONLY on how well they demonstrated the "${focusArea}" skill.

RELEVANCE GATE: You MUST first determine if the candidate actually answered the CURRENT INTERVIEW QUESTION. Semantic relevance is your highest priority. Do not reward technical correctness if the answer belongs to a different question or is completely off-topic.

Return your evaluation as a JSON object matching this exact schema. Do NOT wrap in markdown code blocks (\`\`\`json). Return pure JSON.
{
  "relevanceScore": number, // 0-100: Did they actually answer THIS specific question?
  "score": number, // 0-100: How well they demonstrated the skill. MUST BE LOW if relevanceScore is low.
  "strength": string, // A 1-sentence specific strength in their answer regarding this skill
  "weakness": string, // A 1-sentence specific area of improvement regarding this skill
  "suggestion": string // A 1-sentence actionable tip to improve this skill
}

Be realistic and strict. Do not artificially inflate scores.`;

    try {
      const response = await generateText({
        systemPrompt,
        userPrompt: `CURRENT INTERVIEW QUESTION:\n"${question}"\n\nCANDIDATE ANSWER:\n"${answer}"`,
        maxTokens: 300,
        temperature: 0.7,
        responseFormat: { type: "json_object" }
      });
      
      const parsed = extractJsonFromResponse(response);
      const evalData = FocusEvaluationSchema.parse(parsed);
      
      const rel = evalData.relevanceScore;
      if (rel <= 15) {
        evalData.score = Math.min(evalData.score, 20);
      } else if (rel <= 30) {
        evalData.score = Math.min(evalData.score, 30);
      } else if (rel <= 50) {
        evalData.score = Math.min(evalData.score, 50);
      }
      
      if (rel <= 30) {
        evalData.weakness = "The answer was largely irrelevant to the specific question asked.";
        evalData.suggestion = "Listen carefully to the specific question being asked and respond directly to it.";
      }
      
      return evalData;
    } catch (error) {
      console.error("Focus Practice Evaluation Error:", error);
      return {
        relevanceScore: 100,
        score: 50,
        strength: "Answer recorded.",
        weakness: "Could not perform detailed evaluation.",
        suggestion: "Continue practicing.",
      };
    }
  }
}
