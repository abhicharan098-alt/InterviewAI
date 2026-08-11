import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";
import { extractTextFromPDF } from "@/lib/parsing/pdf";
import { extractTextFromDOCX } from "@/lib/parsing/docx";
import { parseResumeWithAI } from "@/lib/ai/AIResumeParser";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const resume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!resume) {
      return NextResponse.json({ message: "Resume not found" }, { status: 404 });
    }

    if (resume.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Update status to PROCESSING
    await prisma.resume.update({
      where: { id },
      data: { status: "PROCESSING" },
    });

    let rawText = "";

    try {
      console.log("[RESUME] Starting PDF Extraction");
      // Read the file back from the active storage backend (cloud object
      // storage on Vercel, local disk in development). Never touches a
      // server-local file path on Vercel, where the filesystem is read-only.
      const buffer = await storage.readFile(resume.fileUrl);

      if (resume.fileType === "application/pdf") {
        rawText = await extractTextFromPDF(buffer);
      } else {
        rawText = await extractTextFromDOCX(buffer);
      }

      if (!rawText.trim()) {
        console.error("[RESUME] Extraction yielded empty text.");
        throw new Error("No text could be extracted from the file.");
      }
      console.log(`[RESUME] Extracted text length: ${rawText.length}`);

      // Update DB with raw text
      await prisma.resume.update({
        where: { id },
        data: { rawText },
      });

      // Parse with AI
      console.log("[RESUME] AI parsing started");
      const parsedData = await parseResumeWithAI(rawText);
      console.log("[RESUME] AI parsing completed successfully");

      // Save parsed data
      console.log("[RESUME] database update started");
      const updatedResume = await prisma.resume.update({
        where: { id },
        data: {
          parsedData: parsedData as any,
          status: "PARSED",
        },
      });

      console.log("[RESUME] database update completed");
      return NextResponse.json({ resume: updatedResume, message: "Resume parsed successfully" }, { status: 200 });
    } catch (parseError: any) {
      console.error("[RESUME] Parsing failed exception:", parseError);
      
      await prisma.resume.update({
        where: { id },
        data: { status: "FAILED" },
      });

      return NextResponse.json({ message: parseError.message || "Failed to parse resume" }, { status: 400 });
    }

  } catch (error) {
    console.error("Parse API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
