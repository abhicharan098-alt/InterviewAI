import { generateText } from "./OpenRouterClient";

export class QuestionResearchProvider {
  /**
   * Simulates researching real-world industrial scenarios.
   * If an external search API (like Tavily) is added in the future,
   * it should be integrated here.
   */
  static async searchInterviewQuestions(focusArea: string, role: string, experienceLevel: string): Promise<string[]> {
    // In a real implementation with a search API (e.g., Tavily, Google Custom Search),
    // you would call it here:
    // const results = await fetch(`https://api.tavily.com/search?query=${encodeURIComponent(query)}`, { ... })

    // Fallback/LLM-simulated research pipeline:
    const systemPrompt = `You are a researcher collecting REAL-WORLD software engineering interview questions from top tech companies (FAANG, established startups).
Your task is to return exactly 3 extremely realistic, industrial interview scenarios related to the skill: "${focusArea}" for a ${experienceLevel} ${role}.

STRICT RULES:
1. The questions MUST be about real-world software engineering, production issues, system design, scalability, teamwork, or architectural trade-offs.
2. NEVER mention "InterviewAI", "AI Interview Preparation Platform", or any specific application.
3. NEVER assume the candidate built any specific platform unless it's a generic industrial case study.
4. DO NOT provide answers or explanations. ONLY provide the text of the questions.
5. Separate each question with the delimiter "|||".

Example output:
A production API latency suddenly increases by 300%. What would you investigate?|||Design a scalable notification system for millions of users.|||How would you handle a disagreement with a senior engineer regarding database schema design?`;

    try {
      const response = await generateText({
        systemPrompt,
        userPrompt: `Find 3 industrial interview scenarios for ${focusArea}.`,
        maxTokens: 300,
        temperature: 0.7
      });

      const scenarios = response.split("|||").map(q => q.trim()).filter(q => q.length > 0);
      return scenarios;
    } catch (error) {
      console.error("Research Provider Error:", error);
      return [];
    }
  }
}
