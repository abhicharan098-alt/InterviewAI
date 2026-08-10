import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

const FILTER_MAP: Record<string, NotificationType[]> = {
  practice: ['NORMAL_PRACTICE_REMINDER', 'FOCUS_PRACTICE_REMINDER'],
  results:  ['INTERVIEW_RESULT', 'PERSONAL_BEST'],
  achievements: ['ACHIEVEMENT', 'PRACTICE_STREAK'],
};

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page   = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const filter = searchParams.get('filter') || 'all';
    const limit  = 20;
    const skip   = (page - 1) * limit;

    const where: any = { userId: session.user.id };
    if (filter === 'unread') where.read = false;
    else if (FILTER_MAP[filter]) where.type = { in: FILTER_MAP[filter] };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: session.user.id, read: false } }),
    ]);

    return NextResponse.json({ notifications, total, page, totalPages: Math.ceil(total / limit), unreadCount });
  } catch (error) {
    console.error('Notifications GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
