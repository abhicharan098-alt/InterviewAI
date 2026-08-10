import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AICoachPracticeService } from "@/lib/ai/AICoachPracticeService";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { mode } = body;

    if (mode !== "TECHNICAL" && mode !== "RECOMMENDED") {
      return NextResponse.json({ success: false, error: "Invalid mode" }, { status: 400 });
    }

    let configuration;
    if (mode === "TECHNICAL") {
      configuration = await AICoachPracticeService.generateTechnicalPractice(session.user.id);
    } else {
      configuration = await AICoachPracticeService.generateRecommendedPractice(session.user.id);
    }

    return NextResponse.json({ success: true, configuration });
  } catch (error: any) {
    console.error("[Practice Generate API] Error:", error);
    return NextResponse.json({ success: false, error: "Failed to generate practice config" }, { status: 500 });
  }
}
