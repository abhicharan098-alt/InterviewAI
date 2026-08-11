import { z } from "zod";
import { generateText, extractJsonFromResponse } from "./OpenRouterClient";

export const EvaluationSchema = z.object({
  technicalScore: z.coerce.number().transform(Math.round).pipe(z.number().min(0).max(100)),
  communicationScore: z.coerce.number().transform(Math.round).pipe(z.number().min(0).max(100)),
  clarityScore: z.coerce.number().transform(Math.round).pipe(z.number().min(0).max(100)),
  confidenceScore: z.coerce.number().transform(Math.round).pipe(z.number().min(0).max(100)),
  relevanceScore: z.coerce.number().transform(Math.round).pipe(z.number().min(0).max(100)),
  grammarScore: z.coerce.number().transform(Math.round).pipe(z.number().min(0).max(100)),
  overallScore: z.coerce.number().transform(Math.round).pipe(z.number().min(0).max(100)),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  suggestions: z.array(z.string()),
  idealAnswer: z.string(),
});

export type EvaluatedAnswer = z.infer<typeof EvaluationSchema>;

interface EvaluationContext {
  role: string;
  experienceLevel: string;
  interviewType: string;
  difficulty: string;
  question: string;
  category: string;
  answerText: string;
  focusAreas?: string[];
}

export async function evaluateAnswer(context: EvaluationContext): Promise<EvaluatedAnswer> {
  const focusAreasContext = (context.focusAreas && context.focusAreas.length > 0)
    ? `\n7. FOCUS AREAS: The candidate wants to improve in: ${context.focusAreas.join(", ")}. Provide explicit qualitative feedback addressing these areas in the strengths, weaknesses, and suggestions if applicable.`
    : "";

  const systemPrompt = `
You are an expert Senior Technical Interviewer and Communication Coach.
Evaluate the candidate's answer based on the following context:

Role: ${context.role}
Experience Level: ${context.experienceLevel}
Interview Type: ${context.interviewType}
Difficulty: ${context.difficulty}

Question Category: ${context.category}
Question: "${context.question}"

Instructions:
1. Provide a fair, objective evaluation of the candidate's answer.
2. RELEVANCE GATE: You MUST first determine if the candidate actually answered the CURRENT INTERVIEW QUESTION. Semantic relevance is your highest priority. Do not reward technical correctness if the answer belongs to a different question or is completely off-topic.
3. For technical questions, prioritize correctness, depth, and practical knowledge.
4. For behavioral/HR questions, prioritize structure, clarity, and specific examples.
5. Do NOT penalize grammar heavily for technical answers if the meaning is clear.
6. If the question asks for multiple things and the candidate only answers part of it, relevance and completeness must decrease.
7. All scores must be integers between 0 and 100.
8. Return the response STRICTLY as valid JSON matching the exact structure below. Do NOT use markdown code blocks (\`\`\`json). Just pure JSON.
9. CRITICAL: Do NOT copy the example values from the structure below. You MUST calculate actual, dynamic scores based purely on the candidate's performance.${focusAreasContext}

JSON Structure Requirements:
{
  "relevanceScore": 0, // Did they actually answer THIS specific question? (0-100)
  "technicalScore": 0, // How technically accurate is the answer? (Use 100 for non-technical questions if N/A)
  "communicationScore": 0, // How well did they articulate their thoughts?
  "clarityScore": 0, // Was the answer easy to follow and structured?
  "confidenceScore": 0, // Did the answer sound confident and professional?
  "grammarScore": 0, // Basic grammar and sentence structure
  "overallScore": 0, // An overall weighted score. MUST BE LOW if relevanceScore is low.
  "strengths": ["Identify 1-3 specific strengths"],
  "weaknesses": ["Identify 1-3 specific weaknesses"],
  "suggestions": ["Provide actionable suggestions"],
  "idealAnswer": "A comprehensive, ideal response to this specific question."
}
`;

  const userPrompt = `
CURRENT INTERVIEW QUESTION:
"${context.question}"

CANDIDATE ANSWER:
"""
${context.answerText}
"""
`;

  try {
    const text = await generateText({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      responseFormat: { type: "json_object" }
    });
    
    const parsedJson = extractJsonFromResponse(text);
    const evalData = EvaluationSchema.parse(parsedJson);

    // RELEVANCE GATE: Enforce caps on overallScore based on relevance
    const rel = evalData.relevanceScore;
    if (rel <= 15) {
      evalData.overallScore = Math.min(evalData.overallScore, 20);
      evalData.technicalScore = Math.min(evalData.technicalScore, 30);
    } else if (rel <= 30) {
      evalData.overallScore = Math.min(evalData.overallScore, 30);
      evalData.technicalScore = Math.min(evalData.technicalScore, 40);
    } else if (rel <= 50) {
      evalData.overallScore = Math.min(evalData.overallScore, 50);
      evalData.technicalScore = Math.min(evalData.technicalScore, 60);
    }
    
    // If relevance is very low, add a specific weakness
    if (rel <= 30) {
      evalData.weaknesses.unshift("The answer provided was largely irrelevant to the specific question asked.");
    }
    
    return evalData;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const safeDiagnostic = {
        issues: error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
          expected: (issue as any).expected,
          received: (issue as any).received,
        })),
      };
      console.error("AI Evaluation Zod Validation Error:", JSON.stringify(safeDiagnostic, null, 2));
      throw new Error("Validation failed for AI evaluation response.");
    }

    if (error.status === 429) {
      console.warn("AI Evaluation Rate Limit Exceeded.");
      throw new Error("API rate limit exceeded. Please try again in a few moments.");
    }
    
    console.error("AI Evaluation Error:", error);
    throw new Error(error.message || "Failed to evaluate answer using AI.");
  }
}
