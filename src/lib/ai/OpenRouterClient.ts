import { env } from "../env";

interface GenerateTextOptions {
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" };
}

export async function generateText(options: GenerateTextOptions): Promise<string> {
  const model = env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
  const url = "https://openrouter.ai/api/v1/chat/completions";

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.NEXTAUTH_URL || "https://your-domain.com",
          "X-Title": "InterviewAI"
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: options.systemPrompt,
            },
            {
              role: "user",
              content: options.userPrompt,
            },
          ],
          temperature: options.temperature,
          max_tokens: options.maxTokens,
          response_format: options.responseFormat,
        }),
        // Bound each attempt so an unresponsive upstream cannot hang a
        // serverless function until it is killed by its duration limit.
        signal: AbortSignal.timeout(60_000),
      });

      if (!response.ok) {
        const errorText = await response.text();
        const status = response.status;
        
        if (status === 401) {
          throw new Error("Invalid OpenRouter API key.");
        }
        if (status === 402) {
          throw new Error("Insufficient OpenRouter credits.");
        }
        if (status === 429) {
          throw new Error("API rate limit exceeded. Please try again in a few moments.");
        }
        
        // Throw generic error for retries
        throw new Error(`OpenRouter Error ${status}: ${errorText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response structure from OpenRouter.");
      }

      return data.choices[0].message.content;
    } catch (error: any) {
      attempts++;
      
      // Do not retry 401 or 402
      if (error.message.includes("Invalid OpenRouter API key") || 
          error.message.includes("Insufficient OpenRouter credits")) {
        throw error;
      }
      
      if (attempts >= maxAttempts) {
        throw error;
      }
      
      // Backoff (500ms, 1000ms)
      await new Promise(resolve => setTimeout(resolve, attempts * 500));
    }
  }
  
  throw new Error("Failed to generate text after multiple attempts.");
}

export function extractJsonFromResponse(text: string): any {
  const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("No JSON object found in response");
  }
  return JSON.parse(jsonMatch[0]);
}
