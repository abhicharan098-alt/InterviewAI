"use client";

import { Zap, ArrowRight, Brain, LayoutTemplate, MessageSquare } from "lucide-react";
import Link from "next/link";

export function QuickDrill() {
  return (
    <div className="flex flex-col w-full rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-[#0D1424] to-transparent p-5 shadow-xl shadow-black/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-cyan-500/20 text-cyan-400">
          <Zap className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-cyan-300">Quick Drill</h3>
      </div>
      
      <div className="flex items-center justify-between gap-2 mb-5 px-1">
        <div className="flex flex-col items-center gap-2">
          <Brain className="h-4 w-4 text-slate-400" />
          <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500">Think</span>
        </div>
        <div className="h-px flex-1 bg-white/10 mx-1"></div>
        <div className="flex flex-col items-center gap-2">
          <LayoutTemplate className="h-4 w-4 text-slate-400" />
          <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500">Struct</span>
        </div>
        <div className="h-px flex-1 bg-white/10 mx-1"></div>
        <div className="flex flex-col items-center gap-2">
          <MessageSquare className="h-4 w-4 text-cyan-400" />
          <span className="text-[9px] uppercase font-bold tracking-widest text-cyan-400">Answer</span>
        </div>
      </div>

      <Link
        href="/focus-practice"
        className="flex h-10 w-full items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-sm font-semibold text-cyan-400 transition-all hover:bg-cyan-500/20 hover:text-cyan-300"
      >
        Practice Now <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </div>
  );
}
