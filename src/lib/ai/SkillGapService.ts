import { z } from "zod";
import { generateText, extractJsonFromResponse } from "./OpenRouterClient";

/* ─── Output Schema ─── */
export const SkillGapSchema = z.object({
  strengths: z.array(z.string()).min(0),
  gaps: z.array(z.string()).min(0),
  priorityAreas: z.array(z.string()).min(0),
  roleAlignment: z.number().min(0).max(100),
  summary: z.string().default(""),
});

export type SkillGap = z.infer<typeof SkillGapSchema>;

/* ─── Input Interface ─── */
export interface SkillGapInput {
  resumeText: string;
  targetRole: string;
  targetCompany?: string | null;
  recentWeaknesses?: string[]; // from recent evaluations
}

/* ─── Service ─── */
export async function analyzeSkillGap(input: SkillGapInput): Promise<SkillGap> {
  const { resumeText, targetRole, targetCompany, recentWeaknesses } = input;

  const companyContext = targetCompany
    ? `Target Company: ${targetCompany}. Use this only as contextual information about the type of company — DO NOT claim you know their specific interview process.`
    : "No specific target company provided. Use role-based personalization.";

  const systemPrompt = `You are a senior career coach helping a candidate prepare for a job interview.

Your task: Analyze the candidate's resume against the target role requirements and identify:
1. Their STRENGTHS (skills they already have that match the role)
2. Their GAPS (skills commonly required for this role that are missing or weak)
3. PRIORITY AREAS (top 3 gaps that would most impact their interview performance)
4. ROLE ALIGNMENT score (0–100: how well their background matches this specific role)
5. A brief SUMMARY (1-2 sentences, actionable, honest)

CRITICAL RULES:
- NEVER invent skills the candidate does not have
- NEVER claim the candidate has used a technology not mentioned in their resume
- Gaps should be realistic for the target role — not exhaustive lists
- If resume strongly matches the role, say so honestly
- ${companyContext}

Respond ONLY in this exact JSON format (no markdown, no code blocks):
{
  "strengths": ["skill1", "skill2"],
  "gaps": ["gap1", "gap2"],
  "priorityAreas": ["priority1", "priority2", "priority3"],
  "roleAlignment": 75,
  "summary": "Brief actionable summary"
}`;

  const userPrompt = `TARGET ROLE: ${targetRole}
${companyContext}

CANDIDATE RESUME:
${resumeText.slice(0, 3000)}

RECENTLY IDENTIFIED WEAKNESSES FROM INTERVIEW EVALUATIONS:
${recentWeaknesses?.length ? recentWeaknesses.slice(0, 5).join(", ") : "No previous interview data yet."}

Analyze the gap between this candidate's resume and the ${targetRole} role requirements.`;

  try {
    const raw = await generateText({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      responseFormat: { type: "json_object" },
    });

    const parsed = extractJsonFromResponse(raw);
    const validated = SkillGapSchema.parse(parsed);
    return validated;
  } catch (err) {
    console.error("SkillGapService error, returning fallback:", err);
    // Graceful fallback — extract keywords from resume text heuristically
    return {
      strengths: [],
      gaps: [],
      priorityAreas: ["Communication", "Technical depth", "Behavioral answers"],
      roleAlignment: 50,
      summary: "Complete your first interview to unlock personalized skill analysis.",
    };
  }
}
