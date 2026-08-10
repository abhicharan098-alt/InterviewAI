import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateReadiness } from "@/lib/preparation/ReadinessEngine";
import { analyzeSkillGap } from "@/lib/ai/SkillGapService";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user profile
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Fetch user's recent interviews to calculate readiness
    const interviews = await prisma.interview.findMany({
      where: { userId, status: "COMPLETED" },
      orderBy: { createdAt: "desc" },
      take: 10, // Analyze up to last 10
      include: { report: true },
    });

    // Map to ReportSnapshot for engine
    const reportSnapshots = interviews
      .filter((i: any) => i.report !== null)
      .map((i: any) => ({
        technicalScore: i.report!.technicalScore,
        communicationScore: i.report!.communicationScore,
        confidenceScore: i.report!.confidenceScore,
        relevanceScore: i.report!.relevanceScore,
        clarityScore: i.report!.clarityScore ?? 0,
        overallScore: i.report!.overallScore,
        strengths: i.report!.strengths as string[] | null,
        weaknesses: i.report!.weaknesses as string[] | null,
        role: i.role,
      }));

    // Calculate deterministic readiness
    const readiness = calculateReadiness(reportSnapshots, profile.targetRole);

    // Get recent weaknesses from last 3 interviews for skill gap context
    const recentWeaknesses = reportSnapshots
      .slice(0, 3)
      .flatMap((r: any) => r.weaknesses || []);

    // Check if we already have a cached skillGap in the profile's skills field
    let skillGap = null;
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    
    // We'll store it in profile.skills as { _skillGap: { data: ..., updatedAt: ... } }
    const cachedGap = (profile.skills as any)?._skillGap;
    const shouldRefresh = !cachedGap || new Date().getTime() - new Date(cachedGap.updatedAt).getTime() > ONE_WEEK;

    if (shouldRefresh && profile.targetRole) {
      try {
        // Fetch resume to analyze
        const resume = await prisma.resume.findFirst({
          where: { userId },
          orderBy: { uploadedAt: "desc" },
        });

        const resumeText = resume?.parsedData
          ? JSON.stringify(resume.parsedData)
          : "No resume provided.";

        const newSkillGap = await analyzeSkillGap({
          resumeText,
          targetRole: profile.targetRole,
          targetCompany: profile.targetCompany,
          recentWeaknesses,
        });
        
        skillGap = newSkillGap;

        // Cache it in Profile.skills
        const existingSkills = (profile.skills as any) || {};
        await prisma.profile.update({
          where: { id: profile.id },
          data: {
            skills: {
              ...existingSkills,
              _skillGap: {
                data: newSkillGap,
                updatedAt: new Date().toISOString(),
              },
            } as any,
          },
        });
      } catch (err) {
        console.error("Failed to generate skill gap:", err);
      }
    } else {
      skillGap = cachedGap?.data || null;
    }

    return NextResponse.json({
      profile: {
        targetRole: profile.targetRole,
        targetCompany: profile.targetCompany,
        experienceLevel: profile.experienceLevel,
      },
      readiness,
      skillGap,
    });
  } catch (error) {
    console.error("[PREPARATION_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
