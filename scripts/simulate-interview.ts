import { prisma } from "../src/lib/prisma";
import { Difficulty, ExperienceLevel, InterviewMode, InterviewType } from "@prisma/client";
import { generateInterviewQuestions } from "../src/lib/ai/InterviewQuestionGenerator";

async function main() {
  const resume = await prisma.resume.findFirst({
    where: { status: "PARSED" },
    orderBy: { uploadedAt: "desc" },
  });

  if (!resume || !resume.parsedData) {
    console.log("No parsed resume found.");
    return;
  }

  console.log("Generating questions...");
  console.log("Generating questions (mocked)...");
  
  const generated = {
    questions: Array.from({ length: 10 }).map((_, i) => ({
      questionNumber: i + 1,
      question: `This is dummy question ${i + 1} about React.`,
      category: "TECHNICAL",
      difficulty: Difficulty.MEDIUM,
    }))
  };

  console.log(`Generated ${generated.questions.length} questions. Creating interview...`);

  const newInterview = await prisma.interview.create({
    data: {
      userId: resume.userId,
      role: "Frontend Developer",
      experienceLevel: ExperienceLevel.FRESHER,
      interviewType: InterviewType.TECHNICAL,
      difficulty: Difficulty.MEDIUM,
      durationMinutes: 20,
      questionCount: 10,
      mode: InterviewMode.TEXT,
      status: "COMPLETED",
      startedAt: new Date(),
      completedAt: new Date(),
    },
  });

  const questionRecords = generated.questions.map((q) => ({
    interviewId: newInterview.id,
    questionNumber: q.questionNumber,
    question: q.question,
    category: q.category,
    difficulty: q.difficulty,
  }));

  await prisma.interviewQuestion.createMany({
    data: questionRecords,
  });

  const questions = await prisma.interviewQuestion.findMany({
    where: { interviewId: newInterview.id }
  });

  console.log("Answering questions...");
  for (const q of questions) {
    await prisma.interviewAnswer.create({
      data: {
        questionId: q.id,
        answerText: "This is a test answer detailing my experience.",
        durationSec: 30,
      }
    });
  }

  console.log(`Interview created and answered! ID: ${newInterview.id}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
