import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
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
      where: {
        id: id,
      },
      include: {
        questions: {
          orderBy: [
            { questionNumber: 'asc' },
            { createdAt: 'asc' },
          ],
          include: {
            answer: {
              include: {
                evaluation: true
              }
            }
          }
        },
        report: true,
      },
    });

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 });
    }

    if (interview.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ interview });
  } catch (error) {
    console.error("Fetch Interview Error:", error);
    return NextResponse.json({ error: "Failed to fetch interview details" }, { status: 500 });
  }
}
