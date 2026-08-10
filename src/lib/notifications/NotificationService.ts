import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';

interface CreateOptions {
  actionUrl?: string;
  relatedId?: string;
  scheduledFor?: Date;
}

export class NotificationService {
  /** Create a notification, with optional dedup check */
  static async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    opts: CreateOptions = {}
  ) {
    return prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        actionUrl: opts.actionUrl,
        relatedId: opts.relatedId,
        scheduledFor: opts.scheduledFor,
      },
    });
  }

  /** Returns true if a notification of this type+relatedId already exists */
  static async isDuplicate(
    userId: string,
    type: NotificationType,
    relatedId: string
  ): Promise<boolean> {
    const existing = await prisma.notification.findFirst({
      where: { userId, type, relatedId },
      select: { id: true },
    });
    return !!existing;
  }

  /** Returns true if a DAILY_TIP already exists today (UTC) */
  static async hasDailyTipToday(userId: string): Promise<boolean> {
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setUTCHours(23, 59, 59, 999);
    const existing = await prisma.notification.findFirst({
      where: {
        userId,
        type: 'DAILY_TIP',
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      select: { id: true },
    });
    return !!existing;
  }

  /** Returns true if this streak milestone has already been notified */
  static async hasStreakMilestone(userId: string, days: number): Promise<boolean> {
    const relatedId = `streak-${days}`;
    return this.isDuplicate(userId, 'PRACTICE_STREAK', relatedId);
  }

  /** Get or create default notification settings for user */
  static async getSettings(userId: string) {
    return prisma.notificationSettings.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  /** Check if a given notification type is enabled in the user's settings */
  static isTypeEnabled(
    settings: {
      notifyNormalReminder: boolean;
      notifyFocusReminder: boolean;
      notifyResult: boolean;
      notifyPersonalBest: boolean;
      notifyDailyTip: boolean;
      notifyStreak: boolean;
      notifyAchievement: boolean;
    },
    type: NotificationType
  ): boolean {
    switch (type) {
      case 'NORMAL_PRACTICE_REMINDER': return settings.notifyNormalReminder;
      case 'FOCUS_PRACTICE_REMINDER':  return settings.notifyFocusReminder;
      case 'INTERVIEW_RESULT':         return settings.notifyResult;
      case 'PERSONAL_BEST':            return settings.notifyPersonalBest;
      case 'DAILY_TIP':                return settings.notifyDailyTip;
      case 'PRACTICE_STREAK':          return settings.notifyStreak;
      case 'ACHIEVEMENT':              return settings.notifyAchievement;
      default: return true;
    }
  }

  /** Create a daily tip notification if not already sent today and type is enabled */
  static async checkAndCreateDailyTip(userId: string): Promise<void> {
    try {
      const settings = await this.getSettings(userId);
      if (!settings.notifyDailyTip) return;
      const alreadySent = await this.hasDailyTipToday(userId);
      if (alreadySent) return;

      const { getTodaysTip } = await import('./tips');
      const tip = getTodaysTip();

      await this.create(userId, 'DAILY_TIP', tip.title, tip.body, {
        actionUrl: '/focus-practice',
      });
    } catch {
      // Non-critical — swallow errors
    }
  }
}
