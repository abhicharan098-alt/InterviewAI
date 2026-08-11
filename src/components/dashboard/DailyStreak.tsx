"use client";

import { useEffect, useState } from "react";
import { Flame, Loader2, Trophy } from "lucide-react";
import { CinematicFire } from "./CinematicFire";

type CalendarDay = {
  date: string;
  dayName: string;
  completed: boolean;
};

type StreakData = {
  currentStreak: number;
  longestStreak: number;
  weeklyCalendar: CalendarDay[];
};

export function DailyStreak() {
  const [data, setData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const res = await fetch("/api/streak");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load streak:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStreak();
  }, []);

  if (loading) {
    return (
      <div className="flex h-24 w-full lg:max-w-3xl items-center justify-center rounded-2xl border border-white/[0.05] bg-[#0D1424]">
        <Loader2 className="h-5 w-5 animate-spin text-purple-500/50" />
      </div>
    );
  }

  if (!data) return null;

  const getMilestoneMessage = (streak: number) => {
    if (streak >= 100) return "100 days! Incredible consistency! 🏆";
    if (streak >= 50) return "50 days of commitment!";
    if (streak >= 30) return "30-day preparation streak! 🏆";
    if (streak >= 14) return "Two weeks of consistency!";
    if (streak >= 7) return "One week strong! 🔥";
    if (streak >= 3) return "You're building momentum.";
    if (streak === 2) return "Keep your preparation momentum going.";
    return "You're on fire!"; // 1 day or default
  };

  const isHighStreak = data.currentStreak >= 7;

  return (
    <div className="flex w-full min-h-0 h-auto flex-col lg:flex-row lg:items-center justify-between rounded-2xl border border-purple-500/20 bg-gradient-to-r from-purple-500/10 via-[#0D1424] to-[#0D1424] px-6 py-5 shadow-xl shadow-black/20 gap-6">
      
      {/* LEFT: Flame, current streak, message */}
      <div className="flex items-center gap-5">
        <div className="relative h-14 w-14 shrink-0 rounded-2xl border border-orange-500/30 bg-orange-500/10 transition-colors">
          <CinematicFire isHighStreak={isHighStreak} />
        </div>
        
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-white tracking-tight leading-none">{data.currentStreak}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Day{data.currentStreak !== 1 ? 's' : ''}</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mt-1">Current Streak</span>
          <span className="text-[13px] font-medium text-slate-300 mt-1">{getMilestoneMessage(data.currentStreak)}</span>
        </div>
      </div>

      {/* CENTER: Calendar & Longest Streak */}
      <div className="flex flex-col items-center lg:items-start gap-3 border-t lg:border-t-0 lg:border-l border-white/5 pt-5 lg:pt-0 lg:pl-6 flex-1 lg:ml-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
          <Trophy className="h-3 w-3 text-yellow-500/80" />
          Longest: {data.longestStreak} day{data.longestStreak !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-2">
          {data.weeklyCalendar.map((day, i) => (
            <div key={day.date} className="flex flex-col items-center gap-1.5">
              <span className="text-[9px] font-bold text-slate-500">{day.dayName.substring(0, 3)}</span>
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] transition-colors ${
                day.completed 
                  ? "bg-orange-500/20 text-orange-400 ring-1 ring-orange-500/30" 
                  : "bg-white/[0.03] text-slate-600 ring-1 ring-white/[0.05]"
              }`}>
                {day.completed ? "🔥" : "○"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Streak Maintenance Panel */}
      <div className="w-full lg:w-auto shrink-0 flex flex-col justify-center rounded-xl bg-purple-500/5 border border-purple-500/10 p-3 sm:p-4 min-w-[200px]">
        {data.currentStreak === 0 ? (
          <>
            <div className="flex items-center gap-1.5 mb-1">
              <Flame className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400">Start Your Streak</span>
            </div>
            <span className="text-xs text-slate-400">Complete one activity today to begin.</span>
          </>
        ) : data.weeklyCalendar[data.weeklyCalendar.length - 1]?.completed ? (
          <>
            <div className="flex items-center gap-1.5 mb-1">
              <Flame className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Streak Secured</span>
            </div>
            <span className="text-xs text-slate-400">Today's practice is complete.</span>
            <div className="mt-2 pt-2 border-t border-purple-500/10 flex items-center gap-2">
              <span className="text-[10px] text-slate-500 flex items-center gap-1"><span className="text-emerald-400 font-bold">✓</span> TODAY</span>
              <span className="text-[10px] text-slate-600">•</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Come back tomorrow</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 mb-1">
              <Flame className="h-3.5 w-3.5 text-orange-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Keep Streak Alive</span>
            </div>
            <span className="text-xs text-slate-400">Practice today to continue.</span>
            <div className="mt-2 pt-2 border-t border-purple-500/10 flex items-center gap-2">
              <span className="text-[10px] text-slate-500 flex items-center gap-1"><span className="text-orange-400 font-bold">●</span> TODAY</span>
              <span className="text-[10px] text-slate-600">•</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider">Streak active</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
