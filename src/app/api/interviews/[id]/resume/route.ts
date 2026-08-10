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

    if (interview.status !== "PAUSED") {
      // If it's already IN_PROGRESS, just return it. 
      // This handles cases where user navigates back while it's still running.
      return NextResponse.json({ success: true, interview });
    }

    const updated = await prisma.interview.update({
      where: { id },
      data: {
        status: "IN_PROGRESS",
        resumedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, interview: updated });
  } catch (error) {
    console.error("Resume Interview Error:", error);
    return NextResponse.json({ error: "Failed to resume interview" }, { status: 500 });
  }
}