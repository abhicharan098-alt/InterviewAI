import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    let profile = await prisma.profile.findUnique({
      where: { userId },
      include: { user: { select: { name: true } } },
    });

    if (!profile) {
      profile = await prisma.profile.create({
        data: { userId },
        include: { user: { select: { name: true } } },
      });
    }

    return NextResponse.json({
      name: profile.user.name,
      targetRole: profile.targetRole,
      targetCompany: profile.targetCompany,
      experienceLevel: profile.experienceLevel,
      bio: profile.bio,
      location: profile.location,
    });
  } catch (error) {
    console.error("[PROFILE_GET]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { name, targetRole, targetCompany, bio, location } = body;

    // Update user's display name if provided
    if (name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name },
      });
    }

    // Fetch old profile to check if targetRole changed (for _skillGap cache invalidation)
    const oldProfile = await prisma.profile.findUnique({
      where: { userId },
      select: { targetRole: true, skills: true },
    });

    // Build the typed update input — only include known Profile fields
    const profileData: Parameters<typeof prisma.profile.update>[0]["data"] = {
      targetRole: targetRole ?? null,
      targetCompany: targetCompany ?? null,
      bio: bio ?? null,
      location: location ?? null,
    };

    // If targetRole changed, invalidate the cached _skillGap from the skills JSON blob
    if (oldProfile && oldProfile.targetRole !== targetRole) {
      const raw = oldProfile.skills;
      if (raw !== null && typeof raw === "object" && !Array.isArray(raw)) {
        const cloned = { ...(raw as Record<string, unknown>) };
        delete cloned._skillGap;
        profileData.skills = cloned as any;
      }
      // If skills was null/non-object, we simply don't touch it
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: profileData,
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    const errAny = error as any;
    console.error("[PROFILE_PATCH] ERROR:", errAny?.name, errAny?.message, errAny?.code);
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Profile update failed", details: message },
      { status: 500 }
    );
  }
}
