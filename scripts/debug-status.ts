import { prisma } from "../src/lib/prisma";
import { Difficulty, ExperienceLevel, InterviewMode, InterviewType } from "@prisma/client";

async function main() {
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found.");
    return;
  }

  // 1. Create interview manually
  const interview = await prisma.interview.create({
    data: {
      userId: user.id,
      role: "Frontend Developer",
      experienceLevel: ExperienceLevel.FRESHER,
      interviewType: InterviewType.TECHNICAL,
      difficulty: Difficulty.MEDIUM,
      durationMinutes: 10,
      questionCount: 3,
      mode: InterviewMode.TEXT,
      status: "DRAFT",
    },
  });

  // Create mock questions
  await prisma.interviewQuestion.createMany({
    data: [
      { interviewId: interview.id, questionNumber: 1, question: "Q1", category: "TECHNICAL", difficulty: "MEDIUM" },
      { interviewId: interview.id, questionNumber: 2, question: "Q2", category: "TECHNICAL", difficulty: "MEDIUM" },
      { interviewId: interview.id, questionNumber: 3, question: "Q3", category: "TECHNICAL", difficulty: "MEDIUM" },
    ],
  });

  console.log(`[Before Start] status = ${interview.status}`);

  // 2. Mock /start request
  const updated1 = await prisma.interview.update({
    where: { id: interview.id },
    data: {
      status: "IN_PROGRESS",
      startedAt: new Date(),
    },
  });
  console.log(`[After Start] status = ${updated1.status}`);

  // 3. Mock Page load (fetchInterview)
  const fetched = await prisma.interview.findUnique({
    where: { id: interview.id },
    include: { questions: true },
  });
  console.log(`[When Interview Page Loads] status = ${fetched?.status}`);

  // 4. Wait a little
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 5. Mock check before answer
  const beforeAnswer = await prisma.interview.findUnique({
    where: { id: interview.id },
  });
  console.log(`[Immediately Before Answer] status = ${beforeAnswer?.status}`);

  // 6. Mock Answer request
  const qId = fetched?.questions[0].id;
  if (!qId) return;

  if (beforeAnswer?.status !== "IN_PROGRESS") {
    console.log("ERROR: Interview is not in progress (simulated answer route error)");
  } else {
    await prisma.interviewAnswer.create({
      data: {
        questionId: qId,
        answerText: "My answer",
        durationSec: 10,
        submittedAt: new Date(),
      }
    });
    console.log(`[After Answer] Answer successfully stored!`);
  }

  const afterAnswer = await prisma.interview.findUnique({
    where: { id: interview.id },
  });
  console.log(`[After Answer] status = ${afterAnswer?.status}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
