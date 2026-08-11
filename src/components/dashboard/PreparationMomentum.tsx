"use client";

import { Flame, ArrowRight } from "lucide-react";
import Link from "next/link";

export function PreparationMomentum({ completed }: { completed: number }) {
  return (
    <div className="flex flex-col w-full rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 via-[#0D1424] to-transparent p-5 shadow-xl shadow-black/20">
      <div className="flex items-center gap-3 mb-3">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-orange-500/20">
          <Flame className="h-4 w-4 text-orange-400" />
        </div>
        <h3 className="text-sm font-semibold uppercase tracking-widest text-orange-300">Momentum</h3>
      </div>
      <p className="text-sm text-slate-300 mb-4 text-balance">
        You've completed <span className="font-semibold text-white">{completed} practice {completed === 1 ? 'session' : 'sessions'}</span>. Keep your streak going today.
      </p>
      <Link
        href="/practice"
        className="flex h-10 w-full items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 text-sm font-semibold text-orange-400 transition-all hover:bg-orange-500/20 hover:text-orange-300"
      >
        Continue Practice <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </div>
  );
}
