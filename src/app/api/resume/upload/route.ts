import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storage, StorageConfigurationError } from "@/lib/storage";
import {
  validateResumeFile,
  MAX_RESUME_FILE_SIZE,
} from "@/lib/validation/resumeFile";

function scrubError(err: unknown): { name: string; code?: string; message: string } {
  const anyErr = err as { name?: unknown; code?: unknown; message?: unknown } | null | undefined;
  const name = typeof anyErr?.name === "string" ? anyErr.name : "UnknownError";
  const code = typeof anyErr?.code === "string" ? anyErr.code : undefined;
  let message = typeof anyErr?.message === "string" ? anyErr.message : String(err ?? "unknown error");
  // Redact anything that looks like a credential or bearer token.
  message = message
    .replace(/(postgres(?:ql)?:\/\/)[^@\s]+@/gi, "$1***@")
    .replace(/(sk-or-v1-)[A-Za-z0-9]+/gi, "$1***")
    .replace(/(Bearer\s+)[A-Za-z0-9._-]+/gi, "$1***");
  return { name, code, message };
}

// Logged once per cold start so we can confirm the deployed bundle is current.
console.log("[RESUME][LOG] upload route module loaded");

export async function POST(req: NextRequest) {
  // Tracks the exact failing step so the catch block can report it.
  let step = "AUTH";
  try {
    console.log(
      "[RESUME][0/8] REQUEST begin: contentLength=" +
        (req.headers.get("content-length") ?? "unknown")
    );

    step = "AUTH";
    console.log("[RESUME][1/8] STEP_AUTH begin");
    const session = await getServerSession(authOptions);
    console.log("[RESUME][1/8] STEP_AUTH done: hasSession=" + Boolean(session?.user?.id));
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    step = "FORM";
    console.log("[RESUME][2/8] STEP_FORM begin");
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    console.log(
      "[RESUME][2/8] STEP_FORM done: filePresent=" + Boolean(file) +
        ", fileType=" + (file?.type || "none") +
        ", fileSize=" + (file?.size ?? 0)
    );

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    // Verify the user actually exists in the database (protects against ghost sessions after DB reset)
    step = "DB_USER_CHECK";
    console.log("[RESUME][3/8] STEP_DB_USER_CHECK begin");
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });
    console.log("[RESUME][3/8] STEP_DB_USER_CHECK done: userExists=" + Boolean(userExists));

    if (!userExists) {
      return NextResponse.json(
        { message: "Account not found. Please sign out and create a new account." },
        { status: 401 }
      );
    }

    console.log(`[RESUME] upload received`);
    console.log(`[RESUME] file: type=${file.type}, size=${file.size}`);

    // Size checks are also mirrored client-side, but the server is the
    // source of truth.
    if (file.size > MAX_RESUME_FILE_SIZE) {
      return NextResponse.json(
        { message: "File size exceeds the 5MB limit." },
        { status: 400 }
      );
    }

    // Read the whole payload into memory once (Vercel Blob server uploads
    // need the bytes; the file must also fit in the function payload).
    step = "FILE_BUFFER";
    console.log("[RESUME][4/8] STEP_FILE_BUFFER begin: reading " + file.size + " bytes");
    const buffer = Buffer.from(await file.arrayBuffer());
    console.log("[RESUME][4/8] STEP_FILE_BUFFER done: buffer=" + buffer.length + " bytes");

    // Validate declared type, name, extension and binary magic bytes.
    // No storage or DB record is created for invalid files, so failed
    // uploads never leave broken database rows behind.
    step = "VALIDATE";
    console.log("[RESUME][5/8] STEP_VALIDATE begin");
    const validation = validateResumeFile(
      { name: file.name, type: file.type, size: file.size },
      buffer
    );
    console.log(
      "[RESUME][5/8] STEP_VALIDATE " + (validation.ok ? "ok" : "rejected: " + validation.message)
    );
    if (!validation.ok) {
      return NextResponse.json({ message: validation.message }, { status: validation.status });
    }

    // Store file (cloud object storage in production, local disk in dev)
    step = "STORAGE_UPLOAD";
    console.log(
      "[RESUME][6/8] STEP_STORAGE begin: blobToken=" +
        Boolean(process.env.BLOB_READ_WRITE_TOKEN) +
        ", blobStoreId=" +
        Boolean(process.env.BLOB_STORE_ID) +
        ", vercel=" +
        (process.env.VERCEL ?? "?")
    );
    const uploadResult = await storage.uploadFile(
      {
        buffer,
        fileName: validation.safeFileName,
        mimeType: validation.contentType,
      },
      `resumes/${session.user.id}`
    );
    let uploadHost = "local";
    try {
      uploadHost = new URL(uploadResult.path).hostname;
    } catch {
      // not a URL (local filesystem path) — keep "local"
    }
    console.log(
      "[RESUME][6/8] STEP_STORAGE done: size=" + uploadResult.size + ", host=" + uploadHost
    );

    // Create DB record — only after the file is safely stored.
    step = "DB_CREATE";
    console.log("[RESUME][7/8] STEP_DB_CREATE begin");
    let resume;
    try {
      resume = await prisma.resume.create({
        data: {
          userId: session.user.id,
          fileName: validation.safeFileName,
          fileType: validation.contentType,
          fileSize: file.size,
          fileUrl: uploadResult.path,
          status: "UPLOADING",
        },
      });
      console.log("[RESUME][7/8] STEP_DB_CREATE done: id=" + resume.id + ", status=" + resume.status);
    } catch (dbError) {
      // If DB fails (e.g. foreign key constraint), delete the orphaned file from storage
      console.error("[RESUME][7/8] STEP_DB_CREATE threw", scrubError(dbError));
      await storage.deleteFile(uploadResult.path).catch(console.error);
      throw dbError;
    }

    return NextResponse.json(
      { resume, message: "Resume uploaded successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("[RESUME] UPLOAD FAILED at step=" + step, scrubError(error));

    // Surface actionable configuration errors (e.g. missing Vercel Blob
    // token) without leaking internal details.
    if (error instanceof StorageConfigurationError) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { message: "Internal server error during upload" },
      { status: 500 }
    );
  }
}
