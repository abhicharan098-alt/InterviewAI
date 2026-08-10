import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { NotificationType } from '@prisma/client';

const ReminderSchema = z.object({
  interviewId: z.string().uuid(),
  type: z.enum(['NORMAL_PRACTICE_REMINDER', 'FOCUS_PRACTICE_REMINDER']),
  scheduledFor: z.string().datetime(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { interviewId, type, scheduledFor } = ReminderSchema.parse(body);

    // Verify interview ownership
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId, userId: session.user.id },
      select: { id: true, role: true, interviewType: true, focusAreas: true },
    });
    if (!interview) return NextResponse.json({ error: 'Interview not found' }, { status: 404 });

    // Dedup: cancel any existing active reminder for this interview+type
    await prisma.notification.deleteMany({
      where: {
        userId: session.user.id,
        type: type as NotificationType,
        relatedId: interviewId,
        triggeredAt: null,
      },
    });

    const isFocus = interview.interviewType === 'FOCUS_PRACTICE';
    const title = isFocus ? 'Continue Focus Practice? 🎯' : 'Continue Practice? 🎯';
    const areas = interview.focusAreas.slice(0, 3).join(', ');
    const message = isFocus
      ? `You have unfinished Focus Practice for ${areas || 'your selected areas'}. Pick up where you left off!`
      : `You have an unfinished ${interview.role} interview waiting. Ready to continue?`;

    const actionUrl = isFocus
      ? `/focus-practice/${interviewId}`
      : `/interview/${interviewId}`;

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: type as NotificationType,
        title,
        message,
        actionUrl,
        relatedId: interviewId,
        scheduledFor: new Date(scheduledFor),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.name === 'ZodError') return NextResponse.json({ error: error.issues }, { status: 400 });
    return NextResponse.json({ error: 'Failed to create reminder' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const interviewId = url.searchParams.get("interviewId");
    
    if (!interviewId) {
      return NextResponse.json({ error: 'Missing interviewId' }, { status: 400 });
    }

    // Verify interview ownership
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId, userId: session.user.id },
      select: { id: true },
    });
    if (!interview) return NextResponse.json({ error: 'Interview not found' }, { status: 404 });

    await prisma.notification.deleteMany({
      where: {
        userId: session.user.id,
        relatedId: interviewId,
        type: { in: ['NORMAL_PRACTICE_REMINDER', 'FOCUS_PRACTICE_REMINDER'] },
        triggeredAt: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to cancel reminder' }, { status: 500 });
  }
}