import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const resume = await prisma.resume.findUnique({
      where: { id: params.id },
    });

    if (!resume) {
      return NextResponse.json({ message: "Resume not found" }, { status: 404 });
    }

    if (resume.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Delete file
    await storage.deleteFile(resume.fileUrl);

    // Delete from DB
    await prisma.resume.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Resume deleted" }, { status: 200 });
  } catch (error) {
    console.error("Delete resume error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const resume = await prisma.resume.findUnique({
      where: { id: params.id },
    });

    if (!resume) {
      return NextResponse.json({ message: "Resume not found" }, { status: 404 });
    }

    if (resume.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Merge existing parsed data with updates
    const updatedParsedData = {
      ...(resume.parsedData as object),
      ...body,
    };

    const updatedResume = await prisma.resume.update({
      where: { id: params.id },
      data: {
        parsedData: updatedParsedData as any,
      },
    });

    return NextResponse.json({ resume: updatedResume }, { status: 200 });
  } catch (error) {
    console.error("Update resume error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
