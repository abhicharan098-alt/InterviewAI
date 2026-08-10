import { prisma } from "../src/lib/prisma";
import { generateInterviewQuestions } from "../src/lib/ai/InterviewQuestionGenerator";
import { z } from "zod";
import { Difficulty, ExperienceLevel, InterviewMode, InterviewType } from "@prisma/client";

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) throw new Error("No user found");
  
  const userId = user.id;

  const config = {
    role: "Frontend Developer",
    experienceLevel: ExperienceLevel.FRESHER,
    interviewType: InterviewType.TECHNICAL,
    difficulty: Difficulty.MEDIUM,
    durationMinutes: 20,
    questionCount: 10,
    mode: InterviewMode.TEXT,
  };

  const resume = await prisma.resume.findFirst({
    where: {
      userId,
      status: "PARSED",
    },
    orderBy: { uploadedAt: "desc" },
  });

  if (!resume || !resume.parsedData) {
    throw new Error("No parsed resume found for the user.");
  }

  console.log("Found resume:", resume.id);

  try {
    console.log("Generating AI questions...");
    const generated = await generateInterviewQuestions(resume.parsedData as any, config);
    console.log(`Generated ${generated.questions.length} valid questions.`);

    console.log("Creating Prisma transaction...");
    const interview = await prisma.$transaction(async (tx) => {
      const newInterview = await tx.interview.create({
        data: {
          userId,
          role: config.role,
          experienceLevel: config.experienceLevel,
          interviewType: config.interviewType,
          difficulty: config.difficulty,
          durationMinutes: config.durationMinutes,
          questionCount: config.questionCount,
          mode: config.mode,
          status: "DRAFT",
        },
      });

      console.log("Created interview with ID:", newInterview.id);

      const questionRecords = generated.questions.map((q) => ({
        interviewId: newInterview.id,
        questionNumber: q.questionNumber,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
      }));

      await tx.interviewQuestion.createMany({
        data: questionRecords,
      });

      console.log("Created questions for interview ID:", newInterview.id);
      return newInterview;
    });

    console.log("Successfully completed transaction!");
  } catch (error: any) {
    console.error("Backend Error Occurred!");
    if (error.code) {
      console.error("Prisma Error Code:", error.code);
      console.error("Prisma Error Meta:", error.meta);
    }
    console.error("Error Stack:", error.stack);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
