import { PrismaClient } from '@prisma/client';

/** Returns the current consecutive-day practice streak for a user */
export async function calculateStreak(userId: string, db: PrismaClient): Promise<number> {
  try {
    const interviews = await db.interview.findMany({
      where: { userId, status: 'COMPLETED' },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true },
    });

    if (interviews.length === 0) return 0;

    // Collect unique UTC date strings
    const uniqueDays = new Set<string>();
    for (const iv of interviews) {
      if (iv.completedAt) {
        const d = iv.completedAt;
        uniqueDays.add(`${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`);
      }
    }

    const sortedDays = Array.from(uniqueDays).sort().reverse(); // newest first

    const today = new Date();
    const todayKey = `${today.getUTCFullYear()}-${today.getUTCMonth()}-${today.getUTCDate()}`;
    const yesterday = new Date(today);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayKey = `${yesterday.getUTCFullYear()}-${yesterday.getUTCMonth()}-${yesterday.getUTCDate()}`;

    // Streak must include today or yesterday to be active
    if (sortedDays[0] !== todayKey && sortedDays[0] !== yesterdayKey) return 0;

    let streak = 1;
    let prevDate = new Date(
      parseInt(sortedDays[0].split('-')[0]),
      parseInt(sortedDays[0].split('-')[1]),
      parseInt(sortedDays[0].split('-')[2])
    );

    for (let i = 1; i < sortedDays.length; i++) {
      const parts = sortedDays[i].split('-');
      const curDate = new Date(parseInt(parts[0]), parseInt(parts[1]), parseInt(parts[2]));
      const diff = Math.round((prevDate.getTime() - curDate.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        streak++;
        prevDate = curDate;
      } else {
        break;
      }
    }

    return streak;
  } catch {
    return 0;
  }
}

export const STREAK_MILESTONES = [3, 7, 14, 30];
