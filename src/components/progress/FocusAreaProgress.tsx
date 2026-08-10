"use client";

import { Target, BarChart3, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/dashboard/Reveal";

type FocusAreaStat = {
  area: string;
  score: number | null; // null if no data
  interviewsCount: number;
};

export function FocusAreaProgress({ focusAreasData }: { focusAreasData: FocusAreaStat[] }) {
  if (focusAreasData.length === 0) {
    return (
      <Reveal>
        <div className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-white">Focus Area Progress</h2>
            <p className="mt-1 text-sm text-slate-400">Track performance on your personalized skills.</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-[#0D1424]/60 px-6 py-12 text-center">
          <Target className="mx-auto mb-3 h-8 w-8 text-slate-500" />
          <p className="text-sm text-slate-400 max-w-sm mb-4">
            You haven&apos;t selected any focus areas yet. Set them to track your specific skills.
          </p>
          <Link
            href="/focus-areas"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-white/[0.06] px-4 text-sm font-semibold text-slate-200 ring-1 ring-inset ring-white/[0.1] hover:bg-white/[0.1]"
          >
            Set Focus Areas
          </Link>
        </div>
      </Reveal>
    );
  }

  const allEmpty = focusAreasData.every((f) => f.score === null);

  return (
    <Reveal>
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">Focus Area Progress</h2>
          <p className="mt-1 text-sm text-slate-400">Track performance on your personalized skills.</p>
        </div>
        <Link
          href="/focus-areas"
          className="group inline-flex items-center gap-1.5 rounded text-sm font-semibold text-purple-300 transition-colors hover:text-purple-200"
        >
          Manage
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div data-chaos-item="true" className="rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 md:p-7">
        {allEmpty ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <BarChart3 className="mx-auto mb-3 h-8 w-8 text-slate-500" />
            <p className="text-sm text-slate-400 max-w-sm">
              Complete more interviews with these focus areas to see your progress.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {focusAreasData.map((stat) => (
              <div key={stat.area}>
                <div className="mb-1.5 flex min-w-0 items-center justify-between gap-3">
                  <span className="min-w-0 truncate text-sm font-medium text-slate-300">{stat.area}</span>
                  {stat.score !== null ? (
                    <span className="shrink-0 text-sm font-bold text-white tabular-nums">{stat.score}%</span>
                  ) : (
                    <span className="shrink-0 text-[11px] uppercase tracking-wider text-slate-500">No Data</span>
                  )}
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                  {stat.score !== null && (
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 to-violet-500 transition-all duration-1000"
                      style={{ width: `${stat.score}%` }}
                    />
                  )}
                </div>
                {stat.score !== null && (
                  <p className="mt-1.5 text-[11px] text-slate-500">Based on {stat.interviewsCount} interview{stat.interviewsCount !== 1 ? 's' : ''}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Reveal>
  );
}
