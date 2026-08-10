import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { FocusPracticeQuestionGenerator } from "@/lib/ai/FocusPracticeQuestionGenerator";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const mode = body.mode || "TEXT";
    const questionCount = typeof body.questionCount === 'number' ? Math.max(5, Math.min(30, body.questionCount)) : 10;
    const durationMinutes = typeof body.durationMinutes === 'number' ? Math.max(5, Math.min(60, body.durationMinutes)) : 20;

    // Fetch user profile and focus areas
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { focusAreas: true, targetRole: true, experienceLevel: true },
    });

    const focusAreas = profile?.focusAreas || [];
    if (focusAreas.length === 0) {
      return NextResponse.json({ error: "No focus areas selected." }, { status: 400 });
    }

    // Fetch active resume
    const resume = await prisma.resume.findFirst({
      where: {
        userId: session.user.id,
        status: "PARSED",
      },
      orderBy: { uploadedAt: "desc" },
    });

    // Create the interview
    const interview = await prisma.interview.create({
      data: {
        userId: session.user.id,
        role: profile?.targetRole || "Software Engineer",
        experienceLevel: profile?.experienceLevel || "FRESHER",
        interviewType: "FOCUS_PRACTICE",
        difficulty: "MEDIUM",
        durationMinutes: durationMinutes,
        questionCount: questionCount,
        mode: mode,
        focusAreas: focusAreas,
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });

    // Generate the FIRST question immediately
    const firstTargetArea = focusAreas[0];
    const firstQuestion = await FocusPracticeQuestionGenerator.generateQuestion({
      targetFocusArea: firstTargetArea,
      role: interview.role,
      experienceLevel: interview.experienceLevel,
      resumeContext: resume?.parsedData ? JSON.stringify(resume.parsedData) : "",
      previousQuestions: [],
    });

    await prisma.interviewQuestion.create({
      data: {
        interviewId: interview.id,
        questionNumber: 1,
        question: firstQuestion,
        category: firstTargetArea, // store target focus area in category
        difficulty: interview.difficulty,
        topic: firstTargetArea,
      },
    });

    return NextResponse.json({ interviewId: interview.id });
  } catch (error: any) {
    console.error("Focus Practice Creation Error:", error);
    return NextResponse.json({ error: "Failed to create focus practice session" }, { status: 500 });
  }
}
