"use client";

import Link from "next/link";
import { ArrowRight, Target, Plus, CheckCircle2 } from "lucide-react";

export function FocusAreasCard({ focusAreas }: { focusAreas: string[] }) {
  const hasAreas = focusAreas.length > 0;

  return (
    <div data-chaos-item="true" className="flex flex-col rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 md:p-7 transition-all hover:border-purple-500/30">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-500/10 text-purple-400 ring-1 ring-inset ring-purple-500/20">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-[17px] font-bold text-white">Your Focus Areas</h2>
          <p className="text-sm text-slate-400">
            {hasAreas ? `${focusAreas.length} selected` : "Personalize your AI interviewer"}
          </p>
        </div>
      </div>

      <div className="flex flex-col justify-center mt-2">
        {!hasAreas ? (
          <div className="text-center py-4">
            <p className="text-sm text-slate-400 mb-4">
              Choose skills you&apos;d like to improve during practice.
            </p>
            <Link
              href="/focus-areas"
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-white/[0.06] px-4 text-sm font-semibold text-slate-200 ring-1 ring-inset ring-white/[0.1] transition-all hover:bg-purple-500/20 hover:text-purple-300 hover:ring-purple-500/40"
            >
              <Plus className="h-4 w-4" />
              Choose Focus Areas →
            </Link>
          </div>
        ) : (
          <div className="flex flex-col">
            <div className="flex flex-col gap-4">
              <ul className="flex flex-col gap-2.5 mb-2">
                {focusAreas.slice(0, 3).map((area) => (
                  <li key={area} className="flex items-center gap-2.5 text-[15px] font-medium text-slate-200">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span className="truncate">{area}</span>
                  </li>
                ))}
                {focusAreas.length > 3 && (
                  <li className="text-xs font-medium text-slate-500 pl-7">
                    + {focusAreas.length - 3} more
                  </li>
                )}
              </ul>

              {/* How your focus areas help */}
              <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 mt-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">How your focus areas help</p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Your focus areas guide your practice sessions toward the skills that matter most for your interview preparation.
                </p>
              </div>

              {/* Your practice cycle */}
              <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] p-4">
                <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">Your practice cycle</p>
                <div className="flex items-center gap-2 text-[13px] font-medium text-slate-300 flex-wrap">
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10">Focus</span>
                  <ArrowRight className="h-3 w-3 text-slate-500" />
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10">Practice</span>
                  <ArrowRight className="h-3 w-3 text-slate-500" />
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10">Evaluate</span>
                  <ArrowRight className="h-3 w-3 text-slate-500" />
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/10">Improve</span>
                </div>
              </div>

              {/* Tip */}
              <p className="text-[13px] font-medium text-slate-400 leading-relaxed italic mt-1 mb-2">
                <span className="text-emerald-400 not-italic font-semibold mr-1">Tip:</span>
                Prioritize one or two focus areas per session instead of trying to improve everything at once. Consistent targeted practice will help your scores improve faster.
              </p>

              {/* Your next focus */}
              <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Your next focus</p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Prioritize <span className="text-white font-semibold">{focusAreas[0] || "Core Fundamentals"}</span> in your next practice session. Focus on giving concise, structured answers and explaining your reasoning clearly.
                </p>
              </div>

              {/* Progress strategy */}
              <div className="rounded-xl border border-purple-500/10 bg-purple-500/[0.02] p-4 mt-2">
                <p className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2">Progress strategy</p>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Work on one or two focus areas per session, then review your performance before moving to the next skill.
                </p>
              </div>
            </div>
            
            <Link
              href="/focus-practice"
              className="group inline-flex w-full mt-5 items-center justify-center rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition-all hover:brightness-110"
            >
              Practice Focus Areas
              <ArrowRight className="h-4 w-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
