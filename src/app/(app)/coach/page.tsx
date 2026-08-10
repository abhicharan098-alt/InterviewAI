"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Sparkles, TrendingUp, TrendingDown, Target, BrainCircuit,
  MessageSquare, CalendarDays, ArrowRight, Loader2, AlertCircle 
} from "lucide-react";
import { Reveal } from "@/components/dashboard/Reveal";
import { PerformanceBar } from "@/components/dashboard/PerformanceBar";
import { TryAgainButton } from "@/components/dashboard/TryAgainButton";
import type { CoachAnalysis } from "@/lib/ai/PersonalCoachService";
import { AIPracticeModal } from "@/components/coach/AIPracticeModal";

const scoreColor = (n: number) =>
  n >= 70 ? "text-emerald-400" : n >= 50 ? "text-amber-400" : "text-rose-400";

const trendColor = (n: number | null) => {
  if (n === null) return "text-slate-400";
  if (n > 0) return "text-emerald-400";
  if (n < 0) return "text-rose-400";
  return "text-slate-400";
};

export default function CoachPage() {
  const [data, setData] = useState<CoachAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"TECHNICAL" | "RECOMMENDED" | null>(null);

  const openPractice = (mode: "TECHNICAL" | "RECOMMENDED") => {
    setModalMode(mode);
    setModalOpen(true);
  };

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/coach")
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!res.ok || (json && json.success === false)) {
          throw new Error(json?.error || "Failed to load coaching data.");
        }
        return json.data || json; // fallback for backwards compatibility
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("CoachPage Error:", err);
        setErrorMessage(err.message);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
        <p className="text-sm font-medium text-slate-400">
          Your AI Coach is analyzing your performance...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex w-full flex-col items-center justify-center py-24 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/10 text-rose-400 ring-1 ring-inset ring-rose-500/20">
          <AlertCircle className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-white">
          Coaching Unavailable
        </h2>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          {errorMessage || "We encountered an error generating your AI coaching summary."}
        </p>
        <div className="mt-6">
          <TryAgainButton />
        </div>
      </div>
    );
  }

  if (data.totalInterviews === 0) {
    return (
      <div className="mx-auto max-w-3xl py-12 text-center">
        <Reveal>
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/20 ring-1 ring-inset ring-purple-400/30">
              <BrainCircuit className="h-8 w-8 text-purple-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white">🧠 Your AI Coach is ready.</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-slate-300">
            Complete your first interview to unlock personalized coaching insights.
          </p>
          <button
            onClick={() => openPractice("TECHNICAL")}
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 font-semibold text-white transition-all hover:brightness-110"
          >
            Start Practice <ArrowRight className="h-4 w-4" />
          </button>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      <AIPracticeModal open={modalOpen} onOpenChange={setModalOpen} mode={modalMode} />
      {/* Header */}
      <Reveal>
        <header className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-500/20 ring-1 ring-inset ring-purple-400/30">
            <BrainCircuit className="h-7 w-7 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Your AI Interview Coach
          </h1>
          <p className="mt-3 max-w-2xl text-[15px] text-slate-400">
            Personalized guidance based on your interview performance.
          </p>
        </header>
      </Reveal>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column */}
        <div className="flex flex-col gap-6 lg:col-span-8">
          {/* Readiness & Summary */}
          <Reveal delay={100}>
            <div data-chaos-item="true" className="rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 md:p-8">
              <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-widest text-purple-400">
                    Overall Readiness
                  </h2>
                  <div className="mt-2 flex items-baseline gap-4">
                    <span className={`text-4xl font-bold ${scoreColor(data.overallScore ?? 0)}`}>
                      {data.overallScore}%
                    </span>
                    {data.trend !== null && (
                      <span className={`flex items-center gap-1 text-sm font-semibold ${trendColor(data.trend)}`}>
                        {data.trend > 0 ? <TrendingUp className="h-4 w-4" /> : data.trend < 0 ? <TrendingDown className="h-4 w-4" /> : null}
                        {data.trend > 0 ? `Improving +${data.trend}%` : data.trend < 0 ? `Declining ${data.trend}%` : "Stable"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="mt-8 rounded-xl bg-purple-500/[0.04] p-5 ring-1 ring-inset ring-purple-500/10">
                <p className="text-[15px] leading-relaxed text-slate-300">
                  {data.coachingSummary}
                </p>
              </div>
            </div>
          </Reveal>

          {/* Skill Performance */}
          <Reveal delay={200}>
            <div data-chaos-item="true" className="rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 md:p-8">
              <h2 className="mb-6 text-xl font-semibold tracking-tight text-white">
                Skill Performance
              </h2>
              <div className="space-y-6">
                {data.skillBreakdown.map((skill, i) => (
                  <div key={skill.name}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-slate-300">{skill.name}</span>
                      <div className="flex items-center gap-3">
                        {skill.trend !== null && skill.trend !== 0 && (
                          <span className={`text-xs font-semibold ${trendColor(skill.trend)}`}>
                            {skill.trend > 0 ? "+" : ""}{skill.trend}%
                          </span>
                        )}
                        <span className="font-bold text-white">{skill.score}%</span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-600 to-violet-500"
                        style={{ width: `${skill.score}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-slate-500">
                      Based on {skill.evaluations} evaluations
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
          
          {/* Weekly Plan */}
          {data.weeklyPlan && data.weeklyPlan.length > 0 && (
            <Reveal delay={300}>
              <div data-chaos-item="true" className="rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 md:p-8">
                <h2 className="mb-6 text-xl font-semibold tracking-tight text-white">
                  This Week's Plan
                </h2>
                <div className="space-y-3">
                  {data.weeklyPlan.map((plan, i) => (
                    <div key={i} className="flex flex-col gap-2 rounded-xl bg-white/[0.02] p-4 ring-1 ring-inset ring-white/[0.05] sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-xs font-bold text-slate-400">
                          {i + 1}
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">{plan.focus}</p>
                          <p className="text-xs text-slate-400">{plan.day}</p>
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-1.5 rounded-md bg-purple-500/10 px-2.5 py-1 text-xs font-medium text-purple-300">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {plan.activity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          )}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 lg:col-span-4">
          {/* Strongest / Weakest */}
          <Reveal delay={150}>
            <div className="flex flex-col gap-4">
              {data.strongestArea && (
                <div data-chaos-item="true" className="rounded-2xl border border-emerald-500/20 bg-[#0D1424] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">
                    Your Strongest Area
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">{data.strongestArea.name}</p>
                  <p className="mt-1 font-bold text-emerald-300">{data.strongestArea.score}%</p>
                </div>
              )}
              
              {data.weakestArea && (
                <div data-chaos-item="true" className="rounded-2xl border border-amber-500/20 bg-[#0D1424] p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">
                    Biggest Opportunity
                  </p>
                  <p className="mt-1 text-lg font-bold text-white">{data.weakestArea.name}</p>
                  <p className="mt-1 font-bold text-amber-300">{data.weakestArea.score}%</p>
                  {data.recommendations && (
                    <button
                      onClick={() => openPractice("TECHNICAL")}
                      className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-amber-500/10 text-sm font-semibold text-amber-400 transition-colors hover:bg-amber-500/20"
                    >
                      Practice {data.weakestArea?.name || "Weakest Area"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </Reveal>

          {/* Repeated Patterns */}
          {data.repeatedPatterns && data.repeatedPatterns.length > 0 && (
            <Reveal delay={250}>
              <div data-chaos-item="true" className="rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6">
                <h2 className="mb-5 text-lg font-semibold text-white">Repeated Patterns</h2>
                <ul className="space-y-3">
                  {data.repeatedPatterns.map((pattern, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Target className="mt-0.5 h-4 w-4 shrink-0 text-purple-400" />
                      <span className="text-sm leading-relaxed text-slate-300">{pattern}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          )}

          {/* Next Action */}
          {data.recommendations && (
            <Reveal delay={350}>
              <div className="rounded-2xl border border-purple-500/30 bg-purple-500/[0.03] p-6 shadow-xl shadow-purple-900/10">
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-widest text-purple-400">
                  Your Next Action
                </h2>
                <p className="text-lg font-bold text-white">Recommended Practice</p>
                <p className="mt-1 font-semibold text-purple-300">{data.recommendations.focusArea}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">
                  {data.recommendations.reason}
                </p>
                <button
                  onClick={() => openPractice("RECOMMENDED")}
                  className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-purple-600 text-sm font-semibold text-white transition-colors hover:bg-purple-500"
                >
                  <Sparkles className="h-4 w-4" /> Start Recommended Practice
                </button>
              </div>
            </Reveal>
          )}
        </div>
      </div>
    </div>
  );
}
