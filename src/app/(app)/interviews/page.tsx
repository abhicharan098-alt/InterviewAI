import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Activity, Clock, Layout, Target, CalendarDays, Sparkles, ArrowRight, ChevronRight, Mic } from "lucide-react";
import Link from "next/link";
import { retryAsync } from "@/lib/server/retry";
import { ReminderButton } from "@/components/progress/ReminderButton";

const human = (s: string) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : s);

const scoreColor = (n: number) =>
  n >= 80 ? "text-emerald-400" : n >= 60 ? "text-amber-400" : "text-rose-400";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; dot: string; cls: string }> = {
    COMPLETED: {
      label: "Completed",
      dot: "bg-emerald-400",
      cls: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/25",
    },
    IN_PROGRESS: {
      label: "In Progress",
      dot: "bg-sky-400",
      cls: "bg-sky-500/10 text-sky-300 ring-sky-400/25",
    },
    ABANDONED: {
      label: "Abandoned",
      dot: "bg-slate-400",
      cls: "bg-slate-500/10 text-slate-400 ring-white/10",
    },
    DRAFT: {
      label: "Draft",
      dot: "bg-amber-400",
      cls: "bg-amber-500/10 text-amber-300 ring-amber-400/25",
    },
    PAUSED: {
      label: "Paused",
      dot: "bg-purple-400",
      cls: "bg-purple-500/10 text-purple-300 ring-purple-400/25",
    },
  };
  const item = map[status] ?? map.DRAFT;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${item.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} aria-hidden="true" />
      {item.label}
    </span>
  );
}

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default async function InterviewsHistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [interviews, activeReminders] = await retryAsync(() =>
    Promise.all([
      prisma.interview.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        include: {
          report: { select: { overallScore: true, readinessScore: true } },
        },
      }),
      prisma.notification.findMany({
        where: {
          userId: session.user.id,
          type: { in: ["NORMAL_PRACTICE_REMINDER", "FOCUS_PRACTICE_REMINDER"] },
          triggeredAt: null,
        },
        select: { relatedId: true, scheduledFor: true, id: true },
      }),
    ])
  );

  const remindersMap = new Map<string, { id: string; scheduledFor: Date }>();
  activeReminders.forEach((r) => {
    if (r.relatedId && r.scheduledFor) {
      remindersMap.set(r.relatedId, { id: r.id, scheduledFor: r.scheduledFor });
    }
  });

  return (
    <div className="w-full">
      <div className="relative mx-auto w-full">
        {/* Header */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-purple-300/90">
              InterviewAI · History
            </p>
            <h1 className="text-[28px] font-bold leading-tight tracking-tight text-white sm:text-4xl">
              Interview History
            </h1>
            <p className="mt-2 text-[15px] text-slate-400">
              Review your past practice sessions, performance scores, and evaluations.
            </p>
          </div>
          <Link
            href="/practice"
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition-all hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70"
          >
            <Sparkles className="h-4 w-4" />
            New Practice Session
          </Link>
        </header>

        {interviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-[#0D1424]/60 p-14 text-center">
            <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-white/[0.04] text-purple-400 ring-1 ring-inset ring-white/[0.08]">
              <Activity className="h-8 w-8" />
            </div>
            <h2 className="mb-2 text-xl font-semibold text-white">No Interviews Found</h2>
            <p className="mb-6 max-w-md text-sm text-slate-400">
              You haven&apos;t generated any practice interviews yet. Start your first session to receive instant AI evaluation.
            </p>
            <Link
              href="/practice"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition-all hover:brightness-110"
            >
              <Sparkles className="h-4 w-4" />
              Start Practice Session
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {interviews.map((intv) => {
              const score = intv.report?.overallScore ?? intv.report?.readinessScore ?? null;
              const isCompleted = intv.status === "COMPLETED";
              const isUnfinished = !isCompleted && intv.status !== "ABANDONED" && (intv.status === "PAUSED" || intv.status === "IN_PROGRESS" || (intv.status === "DRAFT" && intv.currentQuestionIndex !== undefined));
              const isVoice = intv.mode === "VOICE";
              const isMixed = intv.mode === "MIXED";
              const reminder = remindersMap.get(intv.id);

              return (
                <div
                  key={intv.id}
                  className="group flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 shadow-xl transition-all duration-200 hover:border-purple-500/30 hover:bg-[#10192d]"
                >
                  <div className="min-w-0 space-y-4">
                    {/* Top status bar */}
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={intv.status} />
                      <div className="flex items-center gap-2">
                        {(isVoice || isMixed) && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 text-[11px] font-semibold text-purple-300 ring-1 ring-inset ring-purple-400/20">
                            <Mic className="h-3 w-3" />
                            {isMixed ? "Mixed" : "Voice"}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                          {intv.createdAt.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Role Title */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="min-w-0 truncate text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                          {intv.role}
                        </h3>
                        {intv.source === "AI_COACH" && (
                          <span className="flex items-center gap-1 rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-purple-300">
                            <Sparkles className="h-3 w-3" /> AI
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {human(intv.interviewType)} · {human(intv.difficulty)}
                      </p>
                    </div>

                    {/* Quick details */}
                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/[0.03] p-3 text-xs ring-1 ring-inset ring-white/[0.06]">
                      {intv.status === "PAUSED" ? (
                        <>
                          <div>
                            <span className="text-slate-500 block">Question</span>
                            <span className="font-semibold text-white">{intv.currentQuestionIndex !== undefined ? intv.currentQuestionIndex + 1 : 1} / {intv.questionCount}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Time Left</span>
                            <span className="font-semibold text-purple-400">{intv.remainingSeconds ? formatTime(intv.remainingSeconds) : "--:--"}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <span className="text-slate-500 block">Questions</span>
                            <span className="font-semibold text-white">{intv.questionCount} Qs</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Duration</span>
                            <span className="font-semibold text-white">{intv.durationMinutes} min</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Bottom score & action */}
                  <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                        Score
                      </span>
                      <span
                        className={`text-xl font-bold tabular-nums ${
                          score !== null ? scoreColor(score) : "text-slate-500"
                        }`}
                      >
                        {score !== null ? `${score}%` : "—"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {isUnfinished && (
                        <ReminderButton 
                          interviewId={intv.id} 
                          interviewType={intv.interviewType} 
                          role={intv.role}
                          existingReminder={reminder}
                        />
                      )}
                      <Link
                        href={isCompleted 
                          ? `/interview/${intv.id}/result` 
                          : (intv.interviewType === "FOCUS_PRACTICE" ? `/focus-practice/${intv.id}` : `/interview/${intv.id}`)
                        }
                        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all ${
                          isCompleted
                            ? "bg-purple-500/10 text-purple-300 ring-1 ring-inset ring-purple-400/25 group-hover:bg-purple-600 group-hover:text-white"
                            : "bg-white/[0.06] text-white hover:bg-white/[0.1]"
                        }`}
                      >
                        {isCompleted ? "View Result" : "Resume"}
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
