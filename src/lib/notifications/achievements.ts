import { PrismaClient } from '@prisma/client';
import { NotificationService } from './NotificationService';

interface AchievementDef {
  type: string;
  title: string;
  message: string;
  check: (stats: UserStats) => boolean;
}

interface UserStats {
  completedCount: number;
  allTimeScore: number;
  previousBestScore: number;
  currentScore: number;
  distinctFocusAreas: number;
  currentStreak: number;
}

const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    type: 'FIRST_INTERVIEW',
    title: 'Achievement Unlocked 🏆',
    message: 'You completed your first interview! The journey begins.',
    check: (s) => s.completedCount >= 1,
  },
  {
    type: '5_INTERVIEWS',
    title: 'Achievement Unlocked 🏆',
    message: "You've completed 5 interviews. You're building serious momentum!",
    check: (s) => s.completedCount >= 5,
  },
  {
    type: '10_INTERVIEWS',
    title: 'Achievement Unlocked 🏆',
    message: "10 interviews completed! You're in the top tier of dedicated candidates.",
    check: (s) => s.completedCount >= 10,
  },
  {
    type: '25_INTERVIEWS',
    title: 'Achievement Unlocked 🏆',
    message: "25 interviews! You're a practice powerhouse. Keep pushing!",
    check: (s) => s.completedCount >= 25,
  },
  {
    type: 'FIRST_80_SCORE',
    title: 'Achievement Unlocked 🏆',
    message: 'You scored 80% or above for the first time. Excellent performance!',
    check: (s) => s.currentScore >= 80,
  },
  {
    type: 'SCORE_IMPROVED_15',
    title: 'Achievement Unlocked 🏆',
    message: "You improved your score by 15% or more compared to your previous best. Remarkable growth!",
    check: (s) => s.previousBestScore > 0 && s.currentScore >= s.previousBestScore + 15,
  },
  {
    type: '5_FOCUS_AREAS',
    title: 'Achievement Unlocked 🏆',
    message: "You've practiced 5 or more distinct focus areas. A well-rounded candidate!",
    check: (s) => s.distinctFocusAreas >= 5,
  },
  {
    type: 'STREAK_7',
    title: 'Achievement Unlocked 🏆',
    message: "7-day practice streak! Consistency is the key to interview mastery.",
    check: (s) => s.currentStreak >= 7,
  },
];

export async function checkAchievements(
  userId: string,
  db: PrismaClient,
  currentScore: number,
  previousBestScore: number,
  currentStreak: number
): Promise<void> {
  try {
    // Gather stats
    const [completedInterviews, focusAreaData] = await Promise.all([
      db.interview.count({
        where: { userId, status: 'COMPLETED' },
      }),
      db.interview.findMany({
        where: { userId, status: 'COMPLETED' },
        select: { focusAreas: true },
      }),
    ]);

    const distinctFocusAreas = new Set(
      focusAreaData.flatMap((i) => i.focusAreas)
    ).size;

    const stats: UserStats = {
      completedCount: completedInterviews,
      allTimeScore: 0,
      previousBestScore,
      currentScore,
      distinctFocusAreas,
      currentStreak,
    };

    const settings = await NotificationService.getSettings(userId);
    if (!settings.notifyAchievement) return;

    for (const def of ACHIEVEMENT_DEFS) {
      if (!def.check(stats)) continue;

      // Check if this achievement type already has a notification
      const alreadyNotified = await NotificationService.isDuplicate(
        userId,
        'ACHIEVEMENT',
        def.type
      );
      if (alreadyNotified) continue;

      // Also record in Achievement table
      await db.achievement.upsert({
        where: { id: `${userId}-${def.type}` },
        create: {
          id: `${userId}-${def.type}`,
          userId,
          type: def.type,
          title: def.title,
          description: def.message,
        },
        update: {},
      }).catch(() => {
        // Achievement table may not have composite unique — create only
      });

      await NotificationService.create(
        userId,
        'ACHIEVEMENT',
        def.title,
        def.message,
        {
          actionUrl: '/dashboard',
          relatedId: def.type,
        }
      );
    }
  } catch {
    // Non-critical
  }
}
