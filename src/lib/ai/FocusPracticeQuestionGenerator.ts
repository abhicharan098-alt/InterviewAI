import { generateText } from "./OpenRouterClient";

interface GenerateQuestionConfig {
  targetFocusArea: string;
  role: string;
  experienceLevel: string;
  resumeContext: string;
  previousQuestions: string[];
  lastQuestion?: string;
  lastAnswer?: string;
}

export class FocusPracticeQuestionGenerator {
  /**
   * Generates dynamic prompt guidance based on the focus area.
   */
  private static getFocusAreaGuidance(focusArea: string): string {
    const lowerArea = focusArea.toLowerCase();
    
    if (lowerArea.includes("problem solving")) {
      return "Focus on production incidents, debugging, root-cause analysis, and trade-offs.";
    }
    if (lowerArea.includes("system design")) {
      return "Focus on scalability, architecture, distributed systems, and reliability.";
    }
    if (lowerArea.includes("communication")) {
      return "Focus on stakeholder management, technical communication, and conflict resolution.";
    }
    if (lowerArea.includes("leadership")) {
      return "Focus on prioritization, team decisions, ownership, and handling incidents.";
    }
    if (lowerArea.includes("technical")) {
      return "Focus on APIs, databases, programming challenges, architecture, and performance bottlenecks.";
    }
    if (lowerArea.includes("security")) {
      return "Focus on authentication, authorization, vulnerabilities, and secure system design.";
    }
    if (lowerArea.includes("devops")) {
      return "Focus on CI/CD, monitoring, deployment strategies, infrastructure, and incidents.";
    }
    
    return `Focus specifically on practical, real-world industry scenarios related to ${focusArea}.`;
  }

  /**
   * Validates the generated question against banned terms and criteria.
   */
  private static validateQuestion(question: string, focusArea: string, previousQuestions: string[]): boolean {
    const lowerQ = question.toLowerCase();
    
    // 1. Check for banned words
    const bannedWords = [
      "interviewai",
      "ai interview preparation",
      "this application",
      "this platform",
      "this website",
      "this dashboard",
      "focus practice",
      "performance trend",
      "daily streak",
      "our application",
      "your application",
      "your platform",
      "how you built this",
      "implemented authentication in",
      "how did you build"
    ];
    
    for (const term of bannedWords) {
      if (lowerQ.includes(term)) {
        console.warn(`[FocusResearch] Validation Failed: Contains banned term "${term}". Question: ${question}`);
        return false;
      }
    }
    
    // 2. Check against textbook definitions (heuristic)
    if (lowerQ.startsWith("what is a") || lowerQ.startsWith("define") || lowerQ.startsWith("explain the difference between")) {
      console.warn(`[FocusResearch] Validation Failed: Too basic/definition-based. Question: ${question}`);
      return false;
    }
    
    // 3. Duplicate check
    for (const prev of previousQuestions) {
      if (prev.toLowerCase() === lowerQ) {
        console.warn(`[FocusResearch] Validation Failed: Duplicate question.`);
        return false;
      }
    }
    
    return true;
  }

  static async generateQuestion(config: GenerateQuestionConfig): Promise<string> {
    const isFollowUp = !!(config.lastQuestion && config.lastAnswer);
    const focusGuidance = this.getFocusAreaGuidance(config.targetFocusArea);

    const previousContext = config.previousQuestions.length > 0
      ? `Do NOT ask any of these previous questions: ${config.previousQuestions.join(" | ")}`
      : "";

    const systemPrompt = `You are a professional industry interviewer.
Generate a realistic interview question for the candidate's selected role: ${config.experienceLevel} ${config.role}.

The application hosting this interview is only a tool.
The candidate is NOT assumed to have built or understand this application.

ABSOLUTE PROHIBITIONS:
- NEVER ask about the interview application itself.
- NEVER mention "InterviewAI", "this platform", "this application", "this dashboard", or "your platform".
- NEVER invent candidate projects or experience. 

SCENARIO GUIDANCE:
Focus Area: "${config.targetFocusArea}".
${focusGuidance}
Prefer realistic workplace and production scenarios over textbook definitions.

${config.resumeContext ? `You may use the following resume context ONLY if it contains actual concrete projects to tailor the question: ${config.resumeContext}` : "ONLY ask generic industry questions since no specific resume projects are available."}

${previousContext}

${isFollowUp ? `ADAPTIVE FOLLOW-UP MODE:
The candidate just answered this previous question:
Question: "${config.lastQuestion}"
Answer: "${config.lastAnswer}"

Generate a relevant, challenging technical or behavioral follow-up question. Dig deeper into their reasoning, missing technical details, or real-world trade-offs related to their answer. Do NOT repeat the previous question.` : ""}

Return ONLY the text of the generated question. No quotes, no JSON, no intro.`;

    const userPrompt = isFollowUp 
      ? "Generate the follow-up question based on the candidate's answer."
      : `Generate a scenario-based industry interview question for ${config.targetFocusArea}.`;

    const MAX_RETRIES = 3;
    let fallbackQuestion = `A critical production service related to ${config.targetFocusArea} is experiencing a sudden incident. Walk me through how you would investigate and resolve the issue.`;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await generateText({
          systemPrompt,
          userPrompt,
          maxTokens: 150,
          temperature: 0.7 + (attempt * 0.1) // Increase temperature slightly on retries
        });
        
        let question = response.trim().replace(/^["']|["']$/g, '');

        if (this.validateQuestion(question, config.targetFocusArea, config.previousQuestions)) {
          console.log(`[FocusResearch] Generated valid question on attempt ${attempt}. Source: OpenRouter LLM`);
          return question;
        }
      } catch (error) {
        console.error(`[FocusResearch] Generation error on attempt ${attempt}:`, error);
      }
    }

    // Fallback if all retries fail validation or error out
    console.warn(`[FocusResearch] All ${MAX_RETRIES} attempts failed. Using safe fallback.`);
    return fallbackQuestion;
  }
}

