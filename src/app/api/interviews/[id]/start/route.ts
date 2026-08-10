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

    const interview = await prisma.interview.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found or access denied" }, { status: 404 });
    }

    if (interview.status === "COMPLETED") {
      return NextResponse.json({ error: "Interview already completed" }, { status: 400 });
    }

    const now = new Date();
    const updated = await prisma.interview.update({
      where: { id },
      data: {
        status: "IN_PROGRESS",
        startedAt: interview.startedAt || now,
        resumedAt: now,
        remainingSeconds: interview.remainingSeconds ?? (interview.durationMinutes * 60),
      },
    });

    return NextResponse.json({ success: true, startedAt: updated.startedAt });
  } catch (error) {
    console.error("Start Interview Error:", error);
    return NextResponse.json({ error: "Failed to start interview" }, { status: 500 });
  }
}
