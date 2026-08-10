import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const AnswerSchema = z.object({
  questionId: z.string().uuid(),
  answerText: z.string().optional(),
  durationSec: z.number().min(0),
  skipped: z.boolean().default(false),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = AnswerSchema.parse(body);

    const interview = await prisma.interview.findUnique({
      where: { id, userId: session.user.id },
      include: { questions: true },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    if (interview.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Interview is not in progress" }, { status: 400 });
    }

    const question = interview.questions.find((q) => q.id === data.questionId);
    if (!question) {
      return NextResponse.json({ error: "Question does not belong to this interview" }, { status: 400 });
    }

    // Upsert to prevent duplicate answers for the same question
    const answer = await prisma.interviewAnswer.upsert({
      where: { questionId: data.questionId },
      update: {
        answerText: data.skipped ? "[SKIPPED]" : data.answerText,
        durationSec: data.durationSec,
        submittedAt: new Date(),
      },
      create: {
        questionId: data.questionId,
        answerText: data.skipped ? "[SKIPPED]" : data.answerText,
        durationSec: data.durationSec,
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, answerId: answer.id });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as z.ZodError).issues }, { status: 400 });
    }
    console.error("Answer Submission Error:", error);
    return NextResponse.json({ error: "Failed to submit answer" }, { status: 500 });
  }
}
