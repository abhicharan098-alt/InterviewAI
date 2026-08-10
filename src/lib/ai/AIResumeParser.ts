import { z } from "zod";
import { generateText, extractJsonFromResponse } from "./OpenRouterClient";

export const ResumeSchema = z.object({
  name: z.any().transform(v => typeof v === 'string' ? v : ""),
  email: z.any().transform(v => typeof v === 'string' ? v : ""),
  phone: z.any().transform(v => typeof v === 'string' ? v : ""),
  summary: z.any().transform(v => typeof v === 'string' ? v : ""),
  skills: z.any().transform(v => Array.isArray(v) ? v.filter(s => typeof s === 'string') : []),
  education: z.any().transform(v => Array.isArray(v) ? v.map(e => ({
    institution: typeof e?.institution === 'string' ? e.institution : "",
    degree: typeof e?.degree === 'string' ? e.degree : "",
    field: typeof e?.field === 'string' ? e.field : "",
    startDate: typeof e?.startDate === 'string' ? e.startDate : "",
    endDate: typeof e?.endDate === 'string' ? e.endDate : "",
  })) : []),
  experience: z.any().transform(v => Array.isArray(v) ? v.map(e => ({
    company: typeof e?.company === 'string' ? e.company : "",
    role: typeof e?.role === 'string' ? e.role : "",
    startDate: typeof e?.startDate === 'string' ? e.startDate : "",
    endDate: typeof e?.endDate === 'string' ? e.endDate : "",
    description: typeof e?.description === 'string' ? e.description : "",
  })) : []),
  projects: z.any().transform(v => Array.isArray(v) ? v.map(e => ({
    name: typeof e?.name === 'string' ? e.name : "",
    description: typeof e?.description === 'string' ? e.description : "",
    technologies: Array.isArray(e?.technologies) ? e.technologies.filter((t: any) => typeof t === 'string') : [],
  })) : []),
  certifications: z.any().transform(v => Array.isArray(v) ? v.filter(s => typeof s === 'string') : []),
  achievements: z.any().transform(v => Array.isArray(v) ? v.filter(s => typeof s === 'string') : []),
});

export type ParsedResume = z.infer<typeof ResumeSchema>;

export async function parseResumeWithAI(rawText: string): Promise<ParsedResume> {
  const systemPrompt = `
You are an expert HR system designed to extract structured information from resumes.
Extract the following information from the provided resume text and return it as a pure JSON object.
Do NOT wrap the output in markdown code blocks like \`\`\`json. Return ONLY valid JSON.

Required JSON Structure:
{
  "name": "", // Candidate full name
  "email": "", // Contact email
  "phone": "", // Contact phone number
  "summary": "", // Professional summary or objective
  "skills": ["skill1", "skill2"], // Array of skills
  "education": [
    {
      "institution": "",
      "degree": "",
      "field": "",
      "startDate": "",
      "endDate": ""
    }
  ],
  "experience": [
    {
      "company": "",
      "role": "",
      "startDate": "",
      "endDate": "",
      "description": "" // Bullet points combined or descriptive text
    }
  ],
  "projects": [
    {
      "name": "",
      "description": "",
      "technologies": ["tech1"]
    }
  ],
  "certifications": ["cert1"],
  "achievements": ["achievement1"]
}
`;

  const userPrompt = `
Resume Text to Parse:
"""
${rawText}
"""
`;

  try {
    const text = await generateText({
      systemPrompt,
      userPrompt,
      temperature: 0.1,
      responseFormat: { type: "json_object" }
    });
    
    let parsedJson;
    try {
      parsedJson = extractJsonFromResponse(text);
    } catch (parseErr) {
      console.error("[RESUME] JSON extraction failed:", parseErr);
      throw parseErr;
    }
    
    try {
      const validatedData = ResumeSchema.parse(parsedJson);
      return validatedData;
    } catch (zodErr) {
      console.error("[RESUME] Zod validation failed:", zodErr);
      throw zodErr;
    }
  } catch (error) {
    console.error("AI Parsing Error:", error);
    throw new Error("Failed to parse resume with AI.");
  }
}
