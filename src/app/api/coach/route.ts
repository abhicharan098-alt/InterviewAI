import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PersonalCoachService } from "@/lib/ai/PersonalCoachService";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    let userId = session?.user?.id;
    if (!userId) {
      console.log("[Coach API] Unauthorized access attempt.");
      return NextResponse.json(
        { success: false, error: "Unauthorized access", code: "UNAUTHORIZED" },
        { status: 401 }
      );
    }
    console.log(`[Coach API] Starting coaching data generation for user: ${userId}`);

    const coachingData = await PersonalCoachService.getCoachingData(userId);
    
    console.log(`[Coach API] Successfully generated coaching data for user: ${userId}`);
    return NextResponse.json({ success: true, data: coachingData });
  } catch (error: any) {
    console.error("[Coach API] Critical Error:", error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    return NextResponse.json(
      { 
        success: false, 
        error: "Unable to generate your coaching insights right now.", 
        code: "COACH_GENERATION_FAILED" 
      },
      { status: 500 }
    );
  }
}

