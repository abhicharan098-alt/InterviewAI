import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;

    const [user, profile, notifSettings] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { name: true, email: true, passwordHash: true } }),
      prisma.profile.findUnique({ where: { userId }, select: { targetRole: true, experienceLevel: true } }),
      prisma.notificationSettings.upsert({ where: { userId }, create: { userId }, update: {} }),
    ]);

    return NextResponse.json({
      user: user
        ? {
            name: user.name,
            email: user.email,
            // Lets the UI know if "current password" is required in the settings
            // security section. Only a boolean — the hash is never exposed.
            hasPassword: Boolean(user.passwordHash),
          }
        : null,
      profile,
      notifSettings,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

const SettingsPatchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(8).optional(),
  notifyNormalReminder: z.boolean().optional(),
  notifyFocusReminder: z.boolean().optional(),
  notifyResult: z.boolean().optional(),
  notifyPersonalBest: z.boolean().optional(),
  notifyDailyTip: z.boolean().optional(),
  notifyStreak: z.boolean().optional(),
  notifyAchievement: z.boolean().optional(),
  browserNotifications: z.boolean().optional(),
  dailyTipTime: z.string().optional(),
  defaultReminderMinutes: z.number().int().min(5).max(10080).optional(),
}).passthrough();

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = session.user.id;
    const body = await req.json();
    const data = SettingsPatchSchema.parse(body);

    // Handle password change
    if (data.newPassword) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { passwordHash: true } });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      // Users signed up via Google have no password hash — allow them to create a
      // first password without a "current password". Only enforce the current
      // password when one already exists.
      if (user.passwordHash) {
        if (!data.currentPassword) return NextResponse.json({ error: 'Current password required' }, { status: 400 });
        const valid = await bcrypt.compare(data.currentPassword, user.passwordHash);
        if (!valid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      }
      const hash = await bcrypt.hash(data.newPassword, 12);
      await prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });
    }

    // Update name
    if (data.name !== undefined) {
      await prisma.user.update({ where: { id: userId }, data: { name: data.name } });
    }

    // Update notification settings
    const notifFields: Record<string, unknown> = {};
    const notifKeys = ['notifyNormalReminder','notifyFocusReminder','notifyResult','notifyPersonalBest','notifyDailyTip','notifyStreak','notifyAchievement','browserNotifications','dailyTipTime','defaultReminderMinutes'];
    for (const key of notifKeys) {
      if (data[key as keyof typeof data] !== undefined) notifFields[key] = data[key as keyof typeof data];
    }
    if (Object.keys(notifFields).length > 0) {
      await prisma.notificationSettings.upsert({ where: { userId }, create: { userId, ...notifFields }, update: notifFields });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.name === 'ZodError') return NextResponse.json({ error: error.issues }, { status: 400 });
    console.error('Settings PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}