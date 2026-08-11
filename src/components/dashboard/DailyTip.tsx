import { Lightbulb } from "lucide-react";

export function DailyTip() {
  return (
    <div className="flex flex-col w-full rounded-2xl border border-purple-500/20 bg-gradient-to-br from-purple-500/10 via-[#0D1424] to-transparent p-5 lg:col-span-12 gap-5">
      <div className="flex items-start gap-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-purple-500/20 text-purple-400">
          <Lightbulb className="h-5 w-5" />
        </div>
        <div className="flex flex-col min-w-0">
          <h3 className="text-[15px] font-semibold text-white">Daily Interview Tip</h3>
          <p className="mt-0.5 text-sm text-slate-400 break-words text-balance">
            Use the STAR method (Situation, Task, Action, Result) to structure behavioral answers clearly and confidently.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Before your next interview</p>
          <p className="text-sm text-slate-300 leading-relaxed text-balance">
            Spend 5 minutes reviewing your weakest skill, practice one answer aloud, and focus on clarity rather than speed.
          </p>
        </div>

        <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/[0.02] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1.5">Interview Readiness</p>
          <p className="text-sm text-slate-300 leading-relaxed text-balance">
            Practice → Review → Improve. The fastest progress comes from applying one lesson immediately in your next session.
          </p>
        </div>
      </div>
    </div>
  );
}
