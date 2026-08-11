import { z } from "zod";
import { generateText, extractJsonFromResponse } from "./OpenRouterClient";

/* ─── Zod Schema for AI Adaptive Decision ─── */
export const AdaptiveDecisionSchema = z.object({
  action: z.enum(["FOLLOW_UP", "NEXT_TOPIC"]),
  question: z.string().default(""),
  topic: z.string().default("general"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  followUpType: z
    .enum([
      "CLARIFICATION",
      "DEPTH",
      "WHY",
      "TRADEOFF",
      "SCENARIO",
      "EXPERIENCE",
      "CHALLENGE",
      "RESULT",
      "CORRECTION",
      "NONE",
    ])
    .default("NONE"),
  reason: z.string().default(""),
});

export type AdaptiveDecision = z.infer<typeof AdaptiveDecisionSchema>;

/* ─── Context Interface ─── */
export interface AdaptiveContext {
  role: string;
  experienceLevel: string;
  interviewType: string;
  difficulty: string;
  resumeContext?: string;
  currentQuestion: string;
  currentQuestionTopic?: string;
  candidateAnswer: string;
  previousQuestionsAnswers: Array<{
    question: string;
    answer: string;
    isFollowUp?: boolean;
    topic?: string;
  }>;
  followUpCountForCurrentBase: number; // 0, 1, or 2
  timeRemainingSeconds?: number | null;
  totalDurationSeconds?: number | null;
  configuredQuestionCount: number;
  focusAreas?: string[];
}

export async function decideAdaptiveNextStep(
  ctx: AdaptiveContext
): Promise<AdaptiveDecision> {
  const { candidateAnswer, followUpCountForCurrentBase, timeRemainingSeconds, totalDurationSeconds } = ctx;

  /* Rule 1: If answer was skipped -> NEXT_TOPIC immediately */
  if (!candidateAnswer || candidateAnswer.trim() === "[SKIPPED]" || candidateAnswer.trim().length === 0) {
    return {
      action: "NEXT_TOPIC",
      question: "",
      topic: ctx.currentQuestionTopic || "general",
      difficulty: (ctx.difficulty as "EASY" | "MEDIUM" | "HARD") || "MEDIUM",
      followUpType: "NONE",
      reason: "Candidate skipped the question.",
    };
  }

  /* Rule 2: Follow-up limit (Max 2 follow-ups per base question) */
  if (followUpCountForCurrentBase >= 2) {
    return {
      action: "NEXT_TOPIC",
      question: "",
      topic: ctx.currentQuestionTopic || "general",
      difficulty: (ctx.difficulty as "EASY" | "MEDIUM" | "HARD") || "MEDIUM",
      followUpType: "NONE",
      reason: "Reached maximum follow-up limit (2) for this topic.",
    };
  }

  /* Rule 3: Time limit constraint (< 20% remaining time -> skip follow-up) */
  if (
    typeof timeRemainingSeconds === "number" &&
    typeof totalDurationSeconds === "number" &&
    totalDurationSeconds > 0 &&
    timeRemainingSeconds / totalDurationSeconds < 0.20
  ) {
    return {
      action: "NEXT_TOPIC",
      question: "",
      topic: ctx.currentQuestionTopic || "general",
      difficulty: (ctx.difficulty as "EASY" | "MEDIUM" | "HARD") || "MEDIUM",
      followUpType: "NONE",
      reason: "Less than 20% time remaining; moving to next topic.",
    };
  }

  /* Rule 4: Call AI to evaluate answer and decide FOLLOW_UP vs NEXT_TOPIC */
  try {
    const focusAreasContext = (ctx.focusAreas && ctx.focusAreas.length > 0)
      ? `8. FOCUS AREAS: The candidate specifically wants to improve in: ${ctx.focusAreas.join(", ")}. Whenever generating a follow-up, strongly try to adapt the angle of the question to test or explore these focus areas.`
      : "";

    const systemPrompt = `You are an expert human technical interviewer evaluating a candidate in a live interview for a ${ctx.role} position (${ctx.experienceLevel} level, ${ctx.interviewType} type).

YOUR GOAL:
Act as a natural, professional human interviewer. Analyze the candidate's recent answer and decide whether to ask a concise follow-up question ("FOLLOW_UP") or move to a new topic ("NEXT_TOPIC").

STRICT RULES:
1. You are a REAL INTERVIEWER conducting an industry interview. You are NOT a tutor, coding assistant, or chatbot. Do not give feedback or say "Good job".
2. EXTREMELY IMPORTANT: The application hosting this interview ("InterviewAI" or "AI Interview Preparation Platform") is merely a tool. NEVER ask the candidate how they would build, improve, design, or debug THIS interview platform unless it is EXPLICITLY in their resume.
3. GROUNDING: Stay grounded in the candidate's actual resume experience or generic industry scenarios for their role. Do NOT invent companies or projects. Focus on real-world engineering, business, and production scenarios.
4. WHEN TO FOLLOW UP:
   - If the candidate gave a vague or high-level answer -> followUpType: "CLARIFICATION" or "WHY".
   - If the candidate gave a solid technical answer -> followUpType: "DEPTH", "TRADEOFF", or "SCENARIO".
   - If the candidate made a technical mistake -> followUpType: "CORRECTION" (gently prompt them to reconsider their reasoning).
5. WHEN TO MOVE TO NEXT TOPIC ("action": "NEXT_TOPIC"):
   - If the answer was fully comprehensive with no obvious gaps.
   - If a follow-up would be redundant.
6. CONCISE: Keep follow-up questions clear, professional, and under 30 words.
7. RESPOND ONLY IN STRICT JSON MATCHING THIS SCHEMA:
{
  "action": "FOLLOW_UP" | "NEXT_TOPIC",
  "question": "string (the follow-up question text if action is FOLLOW_UP, otherwise empty string)",
  "topic": "string (short topic tag e.g. react-state, database-indexing)",
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "followUpType": "CLARIFICATION" | "DEPTH" | "WHY" | "TRADEOFF" | "SCENARIO" | "EXPERIENCE" | "CHALLENGE" | "RESULT" | "CORRECTION" | "NONE",
  "reason": "string (brief internal justification)"
}
${focusAreasContext}`;

    const userPrompt = `CANDIDATE RESUME CONTEXT:
${ctx.resumeContext || "No resume provided. Evaluate based on role expectations."}

TARGET ROLE: ${ctx.role} (${ctx.experienceLevel})
INTERVIEW TYPE: ${ctx.interviewType}
DIFFICULTY: ${ctx.difficulty}

PREVIOUS QA CONTEXT:
${ctx.previousQuestionsAnswers
  .map(
    (qa, idx) =>
      `Q${idx + 1}: ${qa.question}\nA${idx + 1}: ${qa.answer}`
  )
  .join("\n\n")}

CURRENT QUESTION ASKED:
"${ctx.currentQuestion}"

CANDIDATE ANSWER GIVEN:
"${ctx.candidateAnswer}"

FOLLOW-UPS ALREADY ASKED FOR THIS TOPIC: ${ctx.followUpCountForCurrentBase}

Decide if a follow-up is useful or if we should move to the next topic. Respond in strict JSON format.`;

    const rawResponse = await generateText({
      systemPrompt,
      userPrompt,
      temperature: 0.5,
      responseFormat: { type: "json_object" },
    });

    const parsedJson = extractJsonFromResponse(rawResponse);
    const decision = AdaptiveDecisionSchema.parse(parsedJson);

    // If decision says FOLLOW_UP but question is empty, fallback to NEXT_TOPIC
    if (decision.action === "FOLLOW_UP" && (!decision.question || decision.question.trim().length < 5)) {
      return {
        action: "NEXT_TOPIC",
        question: "",
        topic: ctx.currentQuestionTopic || "general",
        difficulty: (ctx.difficulty as "EASY" | "MEDIUM" | "HARD") || "MEDIUM",
        followUpType: "NONE",
        reason: "Follow-up question string was empty.",
      };
    }

    return decision;
  } catch (err) {
    console.error("AdaptiveInterviewService AI decision error, falling back to NEXT_TOPIC:", err);
    /* Resilient Fallback: return NEXT_TOPIC so interview continues seamlessly without error */
    return {
      action: "NEXT_TOPIC",
      question: "",
      topic: ctx.currentQuestionTopic || "general",
      difficulty: (ctx.difficulty as "EASY" | "MEDIUM" | "HARD") || "MEDIUM",
      followUpType: "NONE",
      reason: "Fallback triggered due to AI generation or JSON parsing error.",
    };
  }
}
