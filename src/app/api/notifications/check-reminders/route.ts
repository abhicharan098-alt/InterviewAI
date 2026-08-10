import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NotificationService } from '@/lib/notifications/NotificationService';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ triggered: [] });

    const userId = session.user.id;
    const now = new Date();

    // Check and create daily tip (non-blocking)
    NotificationService.checkAndCreateDailyTip(userId).catch(() => {});

    // Find due reminders (scheduledFor <= now, not yet triggered)
    const dueReminders = await prisma.notification.findMany({
      where: {
        userId,
        scheduledFor: { lte: now },
        triggeredAt: null,
      },
      orderBy: { scheduledFor: 'asc' },
    });

    if (dueReminders.length > 0) {
      // Mark them as triggered
      await prisma.notification.updateMany({
        where: { id: { in: dueReminders.map((r) => r.id) } },
        data: { triggeredAt: now },
      });
    }

    // Also return recent 10 notifications for the bell dropdown
    const recent = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, read: false },
    });

    return NextResponse.json({ triggered: dueReminders, recent, unreadCount });
  } catch (error) {
    console.error('Check reminders error:', error);
    return NextResponse.json({ triggered: [], recent: [], unreadCount: 0 });
  }
}