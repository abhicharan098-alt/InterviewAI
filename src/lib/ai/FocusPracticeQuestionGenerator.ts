import { generateText } from "./OpenRouterClient";

interface GenerateQuestionConfig {
  targetFocusArea: string;
  role: string;
  experienceLevel: string;
  resumeContext: string;
  previousQuestions: string[];
}

export class FocusPracticeQuestionGenerator {
  static async generateQuestion(config: GenerateQuestionConfig): Promise<string> {
    const previousContext = config.previousQuestions.length > 0
      ? `Do NOT ask any of these previous questions: ${config.previousQuestions.join(" | ")}`
      : "";

    const systemPrompt = `You are an expert technical and behavioral interviewer.
The candidate is interviewing for a ${config.experienceLevel} ${config.role} position.
Your task is to generate EXACTLY ONE interview question designed specifically to test and improve their skill in: "${config.targetFocusArea}".

${config.resumeContext ? `You can use the following resume context to tailor the question if appropriate, but it is not strictly required: ${config.resumeContext}` : ""}
${previousContext}

Return ONLY the text of the question. No quotes, no intro, no JSON. Just the question itself.`;

    try {
      const response = await generateText({
        systemPrompt,
        userPrompt: "Generate the next question.",
        maxTokens: 150,
        temperature: 0.7
      });
      
      return response.trim().replace(/^["']|["']$/g, '');
    } catch (error) {
      console.error("Focus Practice Question Generation Error:", error);
      return `Can you give an example of how you demonstrate ${config.targetFocusArea} in your work?`;
    }
  }
}
