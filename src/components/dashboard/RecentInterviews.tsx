import { Activity, ArrowRight, CalendarDays, ChevronRight, MessageSquare, Sparkles } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "./StatusBadge";

type RecentInterview = {
  id: string;
  role: string;
  interviewType: string;
  difficulty: string;
  date: Date;
  score: number | null;
  status: string;
  source: string;
};

const human = (s: string) => s ? s.charAt(0) + s.slice(1).toLocaleLowerCase() : s;
const formatDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const scoreColor = (n: number) => n >= 70 ? "text-emerald-400" : n >= 50 ? "text-amber-400" : "text-rose-400";

  export function RecentInterviews({ interviews }: { interviews: RecentInterview[] }) {
    return (
      <div data-chaos-item="true" className="rounded-2xl border border-white/[0.08] bg-[#0D1424] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/[0.04] shrink-0">
          <h3 className="text-lg font-semibold text-white">Recent Interviews</h3>
          <Link href="/interviews" className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
  
        {interviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/[0.03] text-slate-500 mb-4">
              <MessageSquare className="h-6 w-6" />
            </div>
            <p className="text-sm text-slate-400">No interviews yet</p>
          </div>
        ) : (
          <div className="overflow-y-auto custom-scrollbar">
            <ul className="divide-y divide-white/[0.04]">
              {interviews.slice(0, 4).map((item) => {
                const href = item.status === "COMPLETED" ? `/interview/${item.id}/result` : `/interview/${item.id}`;
                return (
                  <li key={item.id}>
                    <Link
                      href={href}
                      className="group flex flex-col gap-3 p-4 md:px-6 transition-colors hover:bg-white/[0.02] md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3.5 flex-1">
                        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/[0.03] text-purple-400">
                          <Activity className="h-4.5 w-4.5" />
                        </div>
                        <div className="min-w-0 flex-1 pr-2">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-[15px] font-semibold leading-5 text-white" title={item.role}>{item.role}</p>
                            {item.source === "AI_COACH" && (
                              <span className="flex items-center gap-1 rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-purple-300">
                                <Sparkles className="h-3 w-3" /> AI
                              </span>
                            )}
                          </div>
                          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13px] text-slate-400">
                            <span className="font-medium text-slate-300 truncate max-w-[100px]">{human(item.interviewType)}</span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 shrink-0">
                              <CalendarDays className="h-3 w-3" />
                              {formatDate(item.date)}
                            </span>
                          </p>
                        </div>
                      </div>
  
                      <div className="flex shrink-0 items-center justify-end gap-3 md:gap-5 w-auto">
                        <div className="text-right min-w-[3rem]">
                          <p className={`text-lg font-bold leading-none tabular-nums ${item.score !== null ? scoreColor(item.score) : "text-slate-500"}`}>
                            {item.score !== null ? `${item.score}%` : "—"}
                          </p>
                        </div>
                        <div className="min-w-[5.5rem] flex justify-end">
                          <StatusBadge status={item.status} />
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-600 transition-colors group-hover:text-purple-400 shrink-0" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    );
  }
