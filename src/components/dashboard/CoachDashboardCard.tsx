"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BrainCircuit, TrendingUp, TrendingDown, Loader2, Activity, Brain, Target, ArrowRight } from "lucide-react";
import type { CoachAnalysis } from "@/lib/ai/PersonalCoachService";

export function CoachDashboardCard() {
  const [data, setData] = useState<CoachAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/coach")
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex w-full flex-col items-center justify-center rounded-2xl border border-purple-500/10 bg-purple-500/[0.02] p-5">
        <Loader2 className="h-6 w-6 animate-spin text-purple-500/50" />
      </div>
    );
  }

  const Step = ({ icon: Icon, title, desc }: any) => (
    <div className="relative flex items-start gap-3">
      <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0B1120] border border-white/[0.08] text-purple-400 shadow-sm">
        <Icon className="h-4 w-4" />
      </div>
      <div className="pt-0.5">
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300">{title}</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{desc}</p>
      </div>
    </div>
  );

  const hasData = data && data.totalInterviews > 0;

  return (
    <div className="flex flex-col rounded-2xl border border-purple-500/30 bg-purple-500/[0.04] p-5 md:p-6 shadow-xl shadow-purple-900/10">
      <div className="flex items-center gap-3 mb-5">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-purple-500/20">
          <BrainCircuit className="h-4 w-4 text-purple-300" />
        </div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-purple-300">AI Coach</h2>
      </div>
      
      <div className="flex flex-col">
        {hasData && data.trend !== null && (
          <div className="mb-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-white px-1">
              {data.trend > 0 ? (
                <><TrendingUp className="h-4 w-4 text-emerald-400" /> You're improving! <span className="text-emerald-400">+{data.trend}%</span></>
              ) : data.trend < 0 ? (
                <><TrendingDown className="h-4 w-4 text-amber-400" /> Score declined <span className="text-amber-400">{data.trend}%</span></>
              ) : (
                "Performance is stable"
              )}
            </p>
          </div>
        )}
        
        <div className="relative mb-5 flex flex-col gap-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="absolute left-[31px] top-8 bottom-8 w-px bg-white/[0.08]" />
          <Step icon={Activity} title="Analyze" desc="Identifies your strongest and weakest skills." />
          <Step icon={Brain} title="Personalize" desc="Converts patterns into targeted coaching." />
          <Step icon={Target} title="Improve" desc="Recommends the next focused practice session." />
        </div>

        <div className="flex flex-col gap-1.5 rounded-xl border border-purple-500/10 bg-purple-500/[0.02] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-1">Your Next Focus</p>
          {hasData ? (
            <>
              <p className="text-sm font-semibold text-white">{data.weakestArea?.name || "General Practice"}</p>
              <p className="text-xs text-slate-400 break-words text-balance">
                {data.recommendations?.reason || "Keep practicing to refine your skills."}
              </p>
            </>
          ) : (
            <p className="text-xs text-slate-400 break-words text-balance">
              Complete your first interview to unlock personalized AI coaching recommendations.
            </p>
          )}
        </div>

        {/* Coaching Goal */}
        <div className="flex flex-col gap-1.5 rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 mt-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Coaching Goal</p>
          {hasData && data.coachingSummary ? (
            <p className="text-xs text-slate-300 break-words text-balance leading-relaxed">
              {data.coachingSummary}
            </p>
          ) : (
            <p className="text-xs text-slate-300 break-words text-balance leading-relaxed">
              Build stronger answers by focusing on clarity, structure, and evidence from your previous interview responses.
            </p>
          )}
        </div>

        {/* Quick Improvement Check */}
        <div className="flex flex-col gap-1.5 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] p-4 mt-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">Quick Improvement Check</p>
          <p className="text-xs text-slate-300 break-words text-balance leading-relaxed">
            After each practice session, identify one strength and one weakness. Apply one specific improvement in your next interview.
          </p>
        </div>
      </div>

      <Link
        href="/coach"
        className="mt-5 flex h-10 w-full items-center justify-center rounded-xl bg-purple-600 text-sm font-semibold text-white transition-colors hover:bg-purple-500"
      >
        View My Coaching <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </div>
  );
}
