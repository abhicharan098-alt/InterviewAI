import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const { remainingSeconds, currentQuestionIndex } = await req.json();

    const interview = await prisma.interview.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found or access denied" }, { status: 404 });
    }

    if (interview.status === "COMPLETED") {
      return NextResponse.json({ error: "Interview already completed" }, { status: 400 });
    }

    const updated = await prisma.interview.update({
      where: { id },
      data: {
        status: "PAUSED",
        remainingSeconds: remainingSeconds ?? interview.remainingSeconds,
        currentQuestionIndex: currentQuestionIndex ?? interview.currentQuestionIndex,
        pausedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, interview: updated });
  } catch (error) {
    console.error("Pause Interview Error:", error);
    return NextResponse.json({ error: "Failed to pause interview" }, { status: 500 });
  }
}