import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Difficulty, ExperienceLevel, InterviewMode, InterviewType } from "@prisma/client";
import { generateInterviewQuestions } from "@/lib/ai/InterviewQuestionGenerator";

const CreateInterviewSchema = z.object({
  role: z.string().min(2, "Role must be provided"),
  experienceLevel: z.nativeEnum(ExperienceLevel),
  interviewType: z.nativeEnum(InterviewType),
  difficulty: z.nativeEnum(Difficulty),
  durationMinutes: z.number().min(5).max(180),
  questionCount: z.number().min(5).max(50),
  mode: z.nativeEnum(InterviewMode),
  targetCompany: z.string().optional().nullable(),
  source: z.string().optional().default("MANUAL"),
  focusAreas: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse configuration
    const body = await req.json();
    const config = CreateInterviewSchema.parse(body);

    // Fetch user's active resume and profile
    const [resume, profile] = await Promise.all([
      prisma.resume.findFirst({
        where: {
          userId: session.user.id,
          status: "PARSED",
        },
        orderBy: { uploadedAt: "desc" },
      }),
      prisma.profile.findUnique({
        where: { userId: session.user.id },
        select: { focusAreas: true },
      }),
    ]);

    if (!resume || !resume.parsedData) {
      return NextResponse.json({ error: "No parsed resume found for the user." }, { status: 400 });
    }
    
    const focusAreas = config.focusAreas && config.focusAreas.length > 0 
      ? config.focusAreas 
      : profile?.focusAreas || [];

    // Fetch recent interviews for personalization context (weak areas, recent topics)
    const recentInterviews = await prisma.interview.findMany({
      where: { userId: session.user.id, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: { report: true },
    });

    const weakAreas = recentInterviews.flatMap(i => (i.report?.weaknesses as string[]) || []);
    
    // In a real app we'd fetch previous questions to build recentTopics, 
    // for now we pass weak areas and company
    const generatorConfig = {
      ...config,
      weakAreas,
      recentTopics: [],
      focusAreas,
    };

    // Generate AI Questions
    const generated = await generateInterviewQuestions(resume.parsedData as any, generatorConfig);

    // Create Interview and Questions in DB using transaction
    const interview = await prisma.$transaction(async (tx) => {
      const newInterview = await tx.interview.create({
        data: {
          userId: session.user.id,
          role: config.role,
          experienceLevel: config.experienceLevel,
          interviewType: config.interviewType,
          difficulty: config.difficulty,
          durationMinutes: config.durationMinutes,
          questionCount: config.questionCount,
          mode: config.mode,
          focusAreas: focusAreas,
          source: config.source,
          status: "DRAFT",
        },
      });

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

      return newInterview;
    });

    return NextResponse.json({ interviewId: interview.id });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as z.ZodError).issues }, { status: 400 });
    }
    console.error("Interview Creation Error:", error);
    return NextResponse.json({ error: "Failed to create interview" }, { status: 500 });
  }
}
