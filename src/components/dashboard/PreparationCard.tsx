import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function PreparationCard({
  targetRole,
  readinessScore
}: {
  targetRole: string | null;
  readinessScore: number;
}) {
  return (
    <div data-chaos-item="true" className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 h-full">
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-600/15 blur-[80px]" />
      
      <div className="relative z-10 flex flex-col min-w-0">
        <p className="text-[11px] font-semibold tracking-widest text-purple-400 uppercase">Active Preparation</p>
        <h3 className="mt-2 text-xl font-bold text-white truncate" title={targetRole || "No Role Selected"}>{targetRole || "No Role Selected"}</h3>
      </div>
      
      <div className="relative z-10 mt-6 flex-1 flex flex-col justify-center">
        <div className="flex items-end justify-between">
          <p className="text-sm text-slate-400">Readiness Score</p>
          <p className="text-3xl font-bold text-white">{readinessScore}%</p>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/[0.05]">
          <div className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-1000 ease-out" style={{ width: `${readinessScore}%` }} />
        </div>
        <div className="mt-4 flex gap-6 text-xs">
          <div className="flex flex-col min-w-0">
            <span className="text-slate-500">Strongest</span>
            <span className="font-medium text-emerald-400 truncate">Technical</span>
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-slate-500">Focus</span>
            <span className="font-medium text-amber-400 truncate">Communication</span>
          </div>
        </div>
      </div>
      
      <div className="relative z-10 mt-6 pt-4 border-t border-white/[0.04]">
        <Link href="/practice" className="inline-flex w-full h-11 items-center justify-center gap-2 rounded-lg bg-white/[0.05] px-4 text-sm font-medium text-white ring-1 ring-inset ring-white/[0.1] transition-all hover:bg-white/[0.1] hover:ring-purple-500/50">
          Continue Practice <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
