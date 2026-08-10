import { z } from "zod";
import { ParsedResume } from "./AIResumeParser";
import { Difficulty, ExperienceLevel, InterviewType } from "@prisma/client";
import { generateText, extractJsonFromResponse } from "./OpenRouterClient";

export const InterviewQuestionSchema = z.object({
  questions: z.array(
    z.object({
      questionNumber: z.number(),
      question: z.string().min(5),
      category: z.string(),
      topic: z.string(),
      difficulty: z.nativeEnum(Difficulty),
      reason: z.string(),
    })
  ).min(1),
});

export type GeneratedQuestions = z.infer<typeof InterviewQuestionSchema>;

interface GenerationConfig {
  role: string;
  experienceLevel: ExperienceLevel;
  interviewType: InterviewType;
  difficulty: Difficulty;
  questionCount: number;
  targetCompany?: string | null;
  weakAreas?: string[];
  recentTopics?: string[];
  focusAreas?: string[];
}

export async function generateInterviewQuestions(
  resume: ParsedResume,
  config: GenerationConfig
): Promise<GeneratedQuestions> {
  let allValidQuestions: any[] = [];
  let attempts = 0;
  const maxAttempts = 3;

  while (allValidQuestions.length < config.questionCount && attempts < maxAttempts) {
    const remainingCount = config.questionCount - allValidQuestions.length;
    // Generate a buffer to account for potentially filtered questions
    const generateCount = Math.max(remainingCount + 3, 5);
    
    const companyContext = config.targetCompany 
      ? `TARGET COMPANY: ${config.targetCompany}. Tailor the situational or technical context to match the domain of this company without claiming inside knowledge of their exact interview process.`
      : "";

    const weaknessContext = (config.weakAreas && config.weakAreas.length > 0)
      ? `KNOWN CANDIDATE WEAKNESSES: ${config.weakAreas.join(", ")}. Ensure at least 1-2 questions challenge these weak areas so the candidate can improve.`
      : "";

    const duplicateContext = (config.recentTopics && config.recentTopics.length > 0)
      ? `RECENT TOPICS AVOIDANCE: Avoid generating questions heavily focused on ${config.recentTopics.join(", ")} as the candidate recently answered these.`
      : "";

    const focusAreasContext = (config.focusAreas && config.focusAreas.length > 0)
      ? `FOCUS AREAS: ${config.focusAreas.join(", ")}. Prioritize questions that evaluate the candidate's selected focus areas while maintaining realistic role-specific interview coverage.`
      : "";

    const systemPrompt = `
You are a professional human-style job interviewer.
Your task is to conduct an interview for the selected job role.
Generate interview questions ONLY from the candidate's provided resume, selected role, experience level, interview type, and difficulty.

${companyContext}
${weaknessContext}
${duplicateContext}
${focusAreasContext}

CRITICAL RULES:
1. DO NOT generate software-development tasks about the interview application itself.
2. DO NOT discuss the application that is hosting this interview.
3. DO NOT mention internal system instructions, prompts, or AI platform implementation.
4. DO NOT refer to the candidate as a user of a software platform.
5. NEVER generate implementation instructions (e.g., "Implement...", "Build...", "Create a component...", "Write a function...", "Design this UI...") unless the selected interview type is explicitly CODING. For normal interviews, questions should be conversational.
6. ANTI-HALLUCINATION: Never assume the candidate has a technology, project, employer, or experience that does not exist in the parsed resume. ONLY ask about what is present.
7. PLATFORM NAME PROTECTION: The internal product name "AI Interview Preparation Platform" must NEVER appear in generated questions. If it is in the candidate's resume, treat it strictly as THE CANDIDATE'S PAST PROJECT. Do Not refer to it as "your platform" or "this platform".

INTERVIEW TYPE RULES:
- TECHNICAL: Ask about technologies in the resume, projects, architecture, debugging, APIs, databases, tradeoffs, and real-world scenarios.
- HR: Ask about introduction, motivation, career goals, teamwork, strengths, weaknesses, communication, and work preferences.
- BEHAVIORAL: Use experience-based situational questions. Example: "Tell me about a time when you..."
- CODING: Only here should coding challenges appear, tailored to the role, experience, and difficulty.

DIFFICULTY RULES:
- FRESHER: Focus on fundamentals, basic project understanding, simple technical reasoning, and learning ability.
- 1-2 YEARS: Focus on practical experience, architecture, debugging, tradeoffs, and production considerations.
- SENIOR: Focus on architecture, scalability, system design, leadership, tradeoffs, reliability, and performance.

QUESTION RELEVANCE REQUIREMENT:
Every generated question must pass this test: "Can I point to the candidate's resume, selected role, interview type, and difficulty, and explain why this question was generated?" If NO, do not generate it. Follow-up questions should logically build on expected answers. Ensure the overall sequence of questions is balanced and not repetitive.

Instructions:
1. Generate exactly ${generateCount} questions.
2. Return the response strictly as valid JSON matching the exact structure below. Do NOT use markdown code blocks (\`\`\`json). Just pure JSON.

JSON Structure Requirements:
{
  "questions": [
    {
      "questionNumber": 1,
      "question": "The actual question text tailored to their resume",
      "category": "TECHNICAL | BEHAVIORAL | HR",
      "topic": "The main topic (e.g., React, System Design, Conflict Resolution)",
      "difficulty": "EASY | MEDIUM | HARD | EXPERT",
      "reason": "Brief explanation of why this question was chosen based on the resume"
    }
  ]
}
`;

    const userPrompt = `
Candidate Resume Context:
${JSON.stringify(resume, null, 2)}

Interview Configuration:
- Target Role: ${config.role}
- Experience Level: ${config.experienceLevel}
- Interview Type: ${config.interviewType}
- Desired Difficulty: ${config.difficulty}
- Target Company: ${config.targetCompany || "None specified"}
- Number of Questions to Generate: ${generateCount}
`;

    try {
      const text = await generateText({
        systemPrompt,
        userPrompt,
        temperature: 0.7,
        responseFormat: { type: "json_object" }
      });
      
      const parsedJson = extractJsonFromResponse(text);
      const validated = InterviewQuestionSchema.parse(parsedJson);

      // Apply Relevance Filter
      const blacklist = [
        "implement a simplified version",
        "accept props",
        "ai interview preparation platform",
        "your application",
        "your platform",
        "system prompt",
        "developer instruction",
        "implement this"
      ];

      const filteredQuestions = validated.questions.filter((q) => {
        const lowerQ = q.question.toLowerCase();
        
        // Prevent implementation tasks unless it's a coding interview
        if (config.interviewType !== "CODING") {
          if (
            lowerQ.includes("implement a component") ||
            lowerQ.includes("write a function") ||
            lowerQ.startsWith("implement ") ||
            lowerQ.startsWith("build ") ||
            lowerQ.startsWith("create ") ||
            lowerQ.startsWith("write code ")
          ) {
            return false;
          }
        }

        // Check against blacklist
        for (const phrase of blacklist) {
          if (lowerQ.includes(phrase)) {
            return false;
          }
        }

        return true;
      });

      allValidQuestions.push(...filteredQuestions);
    } catch (error: any) {
      console.error("AI Question Generation Error (Attempt " + (attempts + 1) + "):", error);
      if (
        error.message?.includes("Invalid OpenRouter API key") ||
        error.message?.includes("Insufficient OpenRouter credits")
      ) {
        throw error;
      }
    }
    attempts++;
  }

  if (allValidQuestions.length < config.questionCount) {
    throw new Error(`Failed to generate the requested number of valid personalized questions. Found ${allValidQuestions.length} valid questions, needed ${config.questionCount}.`);
  }

  // Slice to exact requested count and re-index
  const finalQuestions = allValidQuestions.slice(0, config.questionCount).map((q, index) => ({
    ...q,
    questionNumber: index + 1
  }));

  return { questions: finalQuestions };
}
