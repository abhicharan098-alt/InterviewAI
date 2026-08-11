import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage/LocalProvider";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      console.log("[RESUME] Upload failed: No file provided");
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    // Verify the user actually exists in the database (protects against ghost sessions after DB reset)
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true },
    });
    
    if (!userExists) {
      return NextResponse.json({ message: "Account not found. Please sign out and create a new account." }, { status: 401 });
    }

    console.log(`[RESUME] upload received`);
    console.log(`[RESUME] file name: ${file.name}, type: ${file.type}, size: ${file.size}`);

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ message: "Unsupported file type. Only PDF and DOCX are allowed." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "File size exceeds the 5MB limit." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Store file
    const uploadResult = await storage.uploadFile({
      buffer,
      fileName: file.name,
      mimeType: file.type,
    }, `resumes/${session.user.id}`);

    console.log("[RESUME] file stored at:", uploadResult.path);

    // Create DB record
    let resume;
    try {
      resume = await prisma.resume.create({
        data: {
          userId: session.user.id,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          fileUrl: uploadResult.path,
          status: "UPLOADING",
        },
      });
    } catch (dbError) {
      // If DB fails (e.g. foreign key constraint), delete the orphaned file from storage
      console.error("[RESUME] DB save failed, cleaning up file:", uploadResult.path);
      await storage.deleteFile(uploadResult.path).catch(console.error);
      throw dbError;
    }

    return NextResponse.json({ resume, message: "Resume uploaded successfully" }, { status: 201 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ message: "Internal server error during upload" }, { status: 500 });
  }
}
