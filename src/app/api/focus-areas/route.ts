import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const VALID_FOCUS_AREAS = [
  "Communication Skills",
  "Leadership",
  "Problem Solving",
  "Critical Thinking",
  "Teamwork",
  "Confidence",
  "Time Management",
  "Adaptability",
  "Conflict Resolution",
  "Decision Making",
  "Creativity & Innovation",
  "Emotional Intelligence",
  "Presentation Skills",
  "Technical Skills",
];

const FocusAreasSchema = z.object({
  focusAreas: z.array(z.string().refine(val => VALID_FOCUS_AREAS.includes(val), {
    message: "Invalid focus area selected."
  })).default([]),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      select: { focusAreas: true },
    });

    return NextResponse.json({ focusAreas: profile?.focusAreas || [] });
  } catch (error) {
    console.error("GET Focus Areas Error:", error);
    return NextResponse.json({ error: "Failed to fetch focus areas." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = FocusAreasSchema.parse(body);

    // Remove duplicates
    const uniqueFocusAreas = Array.from(new Set(parsed.focusAreas));

    await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: { focusAreas: uniqueFocusAreas },
      create: {
        userId: session.user.id,
        focusAreas: uniqueFocusAreas,
      },
    });

    return NextResponse.json({ success: true, focusAreas: uniqueFocusAreas });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors[0].message }, { status: 400 });
    }
    console.error("PATCH Focus Areas Error:", error);
    return NextResponse.json({ error: "Failed to save focus areas." }, { status: 500 });
  }
}
