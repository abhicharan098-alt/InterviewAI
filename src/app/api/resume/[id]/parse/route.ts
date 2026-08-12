import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";
import { extractTextFromPDF } from "@/lib/parsing/pdf";
import { extractTextFromDOCX } from "@/lib/parsing/docx";
import { parseResumeWithAI } from "@/lib/ai/AIResumeParser";

// Parsing runs a long pipeline (Prisma cold start + Blob download + PDF/DOCX
// extraction + an OpenRouter AI call with retries + more DB writes). Without
// an explicit duration, Vercel terminates the function at its default limit
// and returns an HTML 504 page, which the client then fails to parse as JSON.
// 300s is the maximum on all plans; on legacy Hobby it is capped at 60s.
export const maxDuration = 300;

// The parsing pipeline depends on Node-only modules (pdfjs-dist legacy build,
// mammoth) and on `Buffer`, so the function must never run on the Edge
// runtime. Explicit is safer than relying on the default.
export const runtime = "nodejs";

// Hard deadline slightly under maxDuration. If the pipeline somehow runs this
// long (e.g. an unresponsive AI provider eating through every retry), the
// deadline fires FIRST and we respond with JSON (+ status FAILED) instead of
// letting Vercel kill the function and answer with an HTML timeout page.
const PARSE_DEADLINE_MS = 285_000;

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

    const parsePipeline = async (): Promise<typeof resume & { parsedData: unknown }> => {
      console.log("[RESUME] Starting PDF Extraction");
      // Read the file back from the active storage backend (cloud object
      // storage on Vercel, local disk in development). Never touches a
      // server-local file path on Vercel, where the filesystem is read-only.
      const buffer = await storage.readFile(resume.fileUrl);

      let rawText: string;
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
      return updatedResume;
    };

    try {
      // Race the pipeline against a deadline so a near-limit invocation still
      // answers with JSON (and a FAILED status) instead of Vercel's HTML 504.
      let deadlineTimer: ReturnType<typeof setTimeout> | undefined;
      const deadline = new Promise<never>((_, reject) => {
        deadlineTimer = setTimeout(
          () => reject(new Error("Resume parsing timed out. Please try again.")),
          PARSE_DEADLINE_MS
        );
      });

      const updatedResume = await Promise.race([parsePipeline(), deadline]);
      if (deadlineTimer) clearTimeout(deadlineTimer);

      return NextResponse.json({ resume: updatedResume, message: "Resume parsed successfully" }, { status: 200 });
    } catch (parseError: any) {
      console.error("[RESUME] Parsing failed exception:", parseError);

      // Persist the failure so the UI shows "Failed" instead of staying on
      // "Processing". Never let this bookkeeping write escape the catch.
      await prisma.resume
        .update({
          where: { id },
          data: { status: "FAILED" },
        })
        .catch(console.error);

      // Surface the real backend error (AI provider message, extraction
      // failure, storage error, timeout) instead of a generic one.
      const message =
        (typeof parseError?.message === "string" && parseError.message.trim()
          ? parseError.message
          : String(parseError ?? "Failed to parse resume")).slice(0, 500);
      const timedOut = /timed out/i.test(message);

      return NextResponse.json({ message }, { status: timedOut ? 504 : 400 });
    }

  } catch (error) {
    console.error("Parse API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
