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
2. For technical questions, prioritize correctness, depth, and practical knowledge.
3. For behavioral/HR questions, prioritize structure, clarity, and specific examples.
4. Do NOT penalize grammar heavily for technical answers if the meaning is clear.
5. All scores must be integers between 0 and 100.
6. Return the response STRICTLY as valid JSON matching the exact structure below. Do NOT use markdown code blocks (\`\`\`json). Just pure JSON.${focusAreasContext}

JSON Structure Requirements:
{
  "technicalScore": 85, // How technically accurate is the answer? (Use 100 for non-technical questions if N/A)
  "communicationScore": 80, // How well did they articulate their thoughts?
  "clarityScore": 82, // Was the answer easy to follow and structured?
  "confidenceScore": 75, // Did the answer sound confident and professional?
  "relevanceScore": 90, // Did they actually answer the question asked?
  "grammarScore": 88, // Basic grammar and sentence structure
  "overallScore": 83, // An overall weighted score for this specific answer
  "strengths": ["Clear explanation", "Good technical depth"],
  "weaknesses": ["Could provide more specific examples"],
  "suggestions": ["Next time, mention the trade-offs of the approach you chose"],
  "idealAnswer": "A comprehensive, ideal response to this specific question."
}
`;

  const userPrompt = `
Candidate's Answer:
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
    return EvaluationSchema.parse(parsedJson);
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
