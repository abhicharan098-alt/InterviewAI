import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // Use UTC for consistent date boundary calculations
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    
    // Date arithmetic
    const yesterday = new Date(now);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    // Transaction to safely update streak and fetch data
    const result = await prisma.$transaction(async (tx) => {
      // 1. Ensure UserStreak exists
      let streak = await tx.userStreak.findUnique({ where: { userId } });
      if (!streak) {
        streak = await tx.userStreak.create({
          data: {
            userId,
            currentStreak: 0,
            longestStreak: 0,
          },
        });
      }

      // 2. Check DailyActivity for today
      const todayActivity = await tx.dailyActivity.findUnique({
        where: { userId_date: { userId, date: todayStr } },
      });

      // If user hasn't had activity today, process streak logic
      if (!todayActivity) {
        // Create today's activity
        await tx.dailyActivity.create({
          data: {
            userId,
            date: todayStr,
          },
        });

        // Determine new streak values
        let newCurrentStreak = 1;
        const lastActivityAt = streak.lastActivityAt;
        
        if (lastActivityAt) {
          const lastActivityStr = lastActivityAt.toISOString().split("T")[0];
          
          if (lastActivityStr === yesterdayStr) {
            // Consecutive day
            newCurrentStreak = streak.currentStreak + 1;
          } else if (lastActivityStr === todayStr) {
            // Edge case (should be caught by todayActivity check, but safety first)
            newCurrentStreak = streak.currentStreak;
          } else {
            // Streak broken (more than 1 day ago)
            newCurrentStreak = 1;
          }
        }

        const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak);

        // Update streak record
        streak = await tx.userStreak.update({
          where: { userId },
          data: {
            currentStreak: newCurrentStreak,
            longestStreak: newLongestStreak,
            lastActivityAt: now,
          },
        });
      }

      // 3. Fetch last 7 days of activity for calendar
      const pastWeek = new Date(now);
      pastWeek.setUTCDate(pastWeek.getUTCDate() - 6);
      
      const recentActivities = await tx.dailyActivity.findMany({
        where: {
          userId,
          createdAt: {
            gte: pastWeek,
          },
        },
        select: { date: true },
        orderBy: { date: "asc" },
      });
      
      return { streak, recentActivities };
    });

    // Format the weekly calendar
    // Generate an array of the last 7 date strings
    const weeklyCalendar = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - (6 - i));
      const dStr = d.toISOString().split("T")[0];
      
      const isCompleted = result.recentActivities.some((a) => a.date === dStr);
      
      const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const dayName = days[d.getUTCDay()];
      
      return {
        date: dStr,
        dayName,
        completed: isCompleted,
      };
    });

    return NextResponse.json({
      currentStreak: result.streak.currentStreak,
      longestStreak: result.streak.longestStreak,
      weeklyCalendar,
    });
  } catch (error) {
    console.error("Streak error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
