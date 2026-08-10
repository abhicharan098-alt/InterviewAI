import { prisma } from "../src/lib/prisma";
import { generateInterviewQuestions } from "../src/lib/ai/InterviewQuestionGenerator";
import { Difficulty, ExperienceLevel, InterviewMode, InterviewType } from "@prisma/client";

async function main() {
  const resume = await prisma.resume.findFirst({
    where: { status: "PARSED" },
    orderBy: { uploadedAt: "desc" },
  });

  if (!resume || !resume.parsedData) {
    console.log("No parsed resume found.");
    process.exit(1);
  }

  console.log("Found resume for user:", resume.userId);

  const config = {
    role: "Frontend Developer",
    experienceLevel: ExperienceLevel.FRESHER,
    interviewType: InterviewType.TECHNICAL,
    difficulty: Difficulty.MEDIUM,
    questionCount: 10,
    mode: InterviewMode.TEXT,
  };

  console.log("Generating questions...");
  const generated = await generateInterviewQuestions(resume.parsedData as any, config);
  
  console.log("\n=== GENERATED QUESTIONS ===");
  console.log(JSON.stringify(generated.questions, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
