const { PrismaClient } = require('@prisma/client');
const fs = require('fs/promises');
const PDFParser = require("pdf2json");

async function extractTextFromPDF(buffer) {
  return new Promise((resolve, reject) => {
    try {
      const pdfParser = new PDFParser(null, 1);
      
      pdfParser.on("pdfParser_dataError", errData => {
        reject(new Error("Failed to extract text from PDF file."));
      });
      
      pdfParser.on("pdfParser_dataReady", () => {
        const text = pdfParser.getRawTextContent();
        resolve(text);
      });
      
      pdfParser.parseBuffer(buffer);
    } catch (error) {
      reject(new Error("Failed to extract text from PDF file."));
    }
  });
}

const prisma = new PrismaClient();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function main() {
  const resume = await prisma.resume.findFirst({ orderBy: { uploadedAt: 'desc' }});
  const buffer = await fs.readFile(resume.fileUrl);
  const rawText = await extractTextFromPDF(buffer);
  
  console.log("Raw text length:", rawText.length);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
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

Resume Text to Parse:
"""
${rawText}
"""
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    console.log("Raw Gemini Output (start):", text.substring(0, 100));
    console.log("Raw Gemini Output (end):", text.substring(text.length - 100));

    if (text.startsWith("\`\`\`json")) {
      text = text.replace(/^\`\`\`json/, "");
    }
    if (text.startsWith("\`\`\`")) {
      text = text.replace(/^\`\`\`/, "");
    }
    if (text.endsWith("\`\`\`")) {
      text = text.replace(/\`\`\`$/, "");
    }
    
    const parsedJson = JSON.parse(text.trim());
    console.log("JSON Parse Success!");
    
    // Test zod (mocking structure)
    console.log("Name:", parsedJson.name);
  } catch (error) {
    console.error("AI Parsing Error:", error);
  }
}

main().finally(() => prisma.$disconnect());
