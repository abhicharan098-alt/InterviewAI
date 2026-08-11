import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Activity,
  TrendingUp,
  Target,
  CircleHelp,
  CalendarDays,
  ChevronRight,
  Star,
  Lightbulb,
  BarChart3,
  WifiOff,
  MessageSquare,
} from "lucide-react";
import { Reveal } from "@/components/dashboard/Reveal";
import { PerformanceBar } from "@/components/dashboard/PerformanceBar";
import { TryAgainButton } from "@/components/dashboard/TryAgainButton";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProgressChart } from "@/components/progress/ProgressChart";
import { FocusAreaProgress } from "@/components/progress/FocusAreaProgress";
import { retryAsync } from "@/lib/server/retry";
import { ReminderButton } from "@/components/progress/ReminderButton";

/* ─────────────────────────────────────────────────────────── helpers */

const avg = (nums: number[]): number | null =>
  nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null;

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const fmtShort = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const human = (s: string) => (s ? s.charAt(0) + s.slice(1).toLowerCase() : s);

const scoreColor = (n: number) =>
  n >= 70 ? "text-emerald-400" : n >= 50 ? "text-amber-400" : "text-rose-400";

/* ─────────────────────────────────────────────────────────── components */

function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

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
    PAUSED: {
      label: "Paused",
      dot: "bg-purple-400",
      cls: "bg-purple-500/10 text-purple-300 ring-purple-400/25",
    },
    DRAFT: {
      label: "Draft",
      dot: "bg-amber-400",
      cls: "bg-amber-500/10 text-amber-300 ring-amber-400/25",
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

function ErrorState() {
  return (
    <div className="min-h-screen bg-[#050814]">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-center px-4 py-24 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.04] text-slate-400 ring-1 ring-inset ring-white/[0.06]">
          <WifiOff className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 className="mt-5 text-lg font-semibold text-white">Unable to load your progress.</h2>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          Something went wrong while fetching your performance data. Your account is safe — please try again.
        </p>
        <div className="mt-6">
          <TryAgainButton />
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-[#0D1424]/60 px-6 py-20 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/[0.04] text-slate-500 ring-1 ring-inset ring-white/[0.06]">
        <BarChart3 className="h-8 w-8" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-white">No performance data yet</h3>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        Complete your first interview to start tracking your progress and unlocking performance insights.
      </p>
      <Link
        href="/practice"
        className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition-all duration-150 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Start Your First Interview
      </Link>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── page */

function formatTime(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const userId = session.user.id;
  let failed = false;

  /* ── data fetch ── */
  type InterviewRow = {
    id: string;
    role: string;
    interviewType: string;
    difficulty: string;
    status: string;
    completedAt: Date | null;
    createdAt: Date;
    focusAreas?: string[];
    remainingSeconds?: number | null;
    currentQuestionIndex?: number;
    questionCount?: number;
    source: string;
    report: {
      overallScore: number;
      readinessScore: number;
      technicalScore: number;
      communicationScore: number;
      confidenceScore: number;
      relevanceScore: number;
    } | null;
  };

  let interviews: InterviewRow[] = [];
  let totalAnswered = 0;
  let activeReminders: { relatedId: string | null; scheduledFor: Date | null; id: string }[] = [];

  try {
    [interviews, totalAnswered] = await retryAsync(async () =>
      Promise.all([
        prisma.interview.findMany({
          where: { userId, status: { not: "ABANDONED" } },
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            role: true,
            interviewType: true,
            difficulty: true,
            status: true,
            completedAt: true,
            createdAt: true,
            focusAreas: true,
            remainingSeconds: true,
            currentQuestionIndex: true,
            questionCount: true,
            source: true,
            report: {
              select: {
                overallScore: true,
                readinessScore: true,
                technicalScore: true,
                communicationScore: true,
                confidenceScore: true,
                relevanceScore: true,
              },
            },
          },
        }) as Promise<InterviewRow[]>,
        prisma.interviewAnswer.count({
          where: {
            answerText: { not: "[SKIPPED]" },
            question: { interview: { userId } },
          },
        }),
        prisma.profile.findUnique({
          where: { userId },
          select: { focusAreas: true },
        }),
        prisma.notification.findMany({
          where: {
            userId,
            type: { in: ["NORMAL_PRACTICE_REMINDER", "FOCUS_PRACTICE_REMINDER"] },
            triggeredAt: null,
          },
          select: { relatedId: true, scheduledFor: true, id: true },
        }),
      ])
    );
  } catch (err) {
    console.error("Progress page data load failed:", err);
    failed = true;
  }

  if (failed) return <ErrorState />;

  const remindersMap = new Map<string, { id: string; scheduledFor: Date }>();
  activeReminders.forEach((r) => {
    if (r.relatedId && r.scheduledFor) {
      remindersMap.set(r.relatedId, { id: r.id, scheduledFor: r.scheduledFor });
    }
  });

  const withReports = interviews.filter((i) => i.report !== null);
  const hasData = withReports.length > 0;

  // Extract focus areas from the array returned by Promise.all
  let profileFocusAreas: string[] = [];
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { focusAreas: true },
    });
    profileFocusAreas = profile?.focusAreas || [];
  } catch (e) {
    console.error("Failed to fetch profile focus areas", e);
  }

  /* calculate focus area stats */
  const focusAreasData = profileFocusAreas.map(area => {
    const relevantInterviews = withReports.filter(i => (i as any).focusAreas?.includes(area));
    if (relevantInterviews.length === 0) {
      return { area, score: null, interviewsCount: 0 };
    }
    const scores = relevantInterviews.map(i => i.report!.overallScore);
    const avgScore = avg(scores);
    return { area, score: avgScore, interviewsCount: relevantInterviews.length };
  });

  const scores = withReports.map((i) => i.report!.overallScore);
  const avgScore = avg(scores);
  const bestScore = scores.length ? Math.max(...scores) : null;
  const bestInterview = scores.length
    ? withReports.reduce((best, i) =>
        (i.report!.overallScore > best.report!.overallScore ? i : best)
      )
    : null;

  const avgTech = avg(withReports.map((i) => i.report!.technicalScore));
  const avgComm = avg(withReports.map((i) => i.report!.communicationScore));
  const avgConf = avg(withReports.map((i) => i.report!.confidenceScore));
  const avgRel = avg(withReports.map((i) => i.report!.relevanceScore));

  /* trend chart data — send raw timestamp and score to client */
  const trendData = withReports
    .filter((i) => typeof i.report?.readinessScore === 'number')
    .map((i) => ({
      date: (i.completedAt ?? i.createdAt).toISOString(),
      score: i.report!.readinessScore,
      interviewId: i.id,
    }));

  /* score change */
  let scoreChange: number | null = null;
  if (withReports.length >= 2) {
    const last = withReports[withReports.length - 1].report!.overallScore;
    const prev = withReports[withReports.length - 2].report!.overallScore;
    scoreChange = last - prev;
  }
  const latestScore =
    withReports.length > 0
      ? withReports[withReports.length - 1].report!.overallScore
      : null;

  /* strongest / weakest */
  const skillMap = [
    { key: "Technical", val: avgTech },
    { key: "Communication", val: avgComm },
    { key: "Confidence", val: avgConf },
    { key: "Relevance", val: avgRel },
  ].filter((s) => s.val !== null) as { key: string; val: number }[];

  const strongest = skillMap.length
    ? skillMap.reduce((a, b) => (a.val >= b.val ? a : b))
    : null;
  const weakest = skillMap.length
    ? skillMap.reduce((a, b) => (a.val <= b.val ? a : b))
    : null;

  /* role performance */
  const roleMap: Record<string, number[]> = {};
  for (const i of withReports) {
    if (!roleMap[i.role]) roleMap[i.role] = [];
    roleMap[i.role].push(i.report!.overallScore);
  }
  const rolePerf = Object.entries(roleMap)
    .map(([role, s]) => ({ role, score: avg(s)! }))
    .sort((a, b) => b.score - a.score);

  /* type performance */
  const typeMap: Record<string, number[]> = {};
  for (const i of withReports) {
    if (!typeMap[i.interviewType]) typeMap[i.interviewType] = [];
    typeMap[i.interviewType].push(i.report!.overallScore);
  }
  const typePerf = Object.entries(typeMap)
    .map(([type, s]) => ({ type, score: avg(s)! }))
    .sort((a, b) => b.score - a.score);

  /* recent 5 (desc) */
  const recent = [...interviews]
    .reverse()
    .slice(0, 5)
    .map((i) => ({
      id: i.id,
      role: i.role,
      interviewType: i.interviewType,
      difficulty: i.difficulty,
      date: i.completedAt ?? i.createdAt,
      score: i.report?.overallScore ?? null,
      status: i.status,
      remainingSeconds: i.remainingSeconds,
      currentQuestionIndex: i.currentQuestionIndex,
      questionCount: i.questionCount,
      source: i.source,
    }));

  /* improvement recommendations */
  const recommendations: Record<string, { title: string; desc: string }> = {
    Technical: {
      title: "Focus on technical depth",
      desc: "Review core concepts related to your target role and practice explaining your reasoning clearly.",
    },
    Communication: {
      title: "Focus on communication",
      desc: "Keep answers concise and structured. Use a clear beginning, explanation, and conclusion.",
    },
    Confidence: {
      title: "Focus on confidence",
      desc: "Practice answering aloud and structure your responses before speaking. Take a breath before replying.",
    },
    Relevance: {
      title: "Focus on relevance",
      desc: "Read each question carefully and answer what is asked. Avoid tangents and stay on-topic.",
    },
  };
  const recommendation = weakest ? recommendations[weakest.key] : null;

  return (
    <div className="w-full">
      <div className="relative mx-auto w-full">

        {/* ── Header ── */}
        <Reveal>
          <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-purple-300/90">
                InterviewAI · Progress
              </p>
              <h1 className="text-balance text-[28px] font-bold leading-tight tracking-tight text-white sm:text-4xl">
                Your Progress
              </h1>
              <p className="mt-2 text-balance text-[15px] text-slate-400">
                Track your interview performance and see where you&apos;re improving.
              </p>
            </div>
            <Link
              href="/practice"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 text-[15px] font-semibold text-white shadow-lg shadow-purple-950/40 transition-all duration-150 hover:brightness-110 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#050814]"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Start Practice
            </Link>
          </header>
        </Reveal>

        {/* ── Quick Stats ── */}
        <div className="mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          <Reveal delay={0}>
            <StatCard label="Interviews completed" value={interviews.length} icon="activity" />
          </Reveal>
          <Reveal delay={60}>
            <StatCard label="Average score" value={avgScore} suffix="%" icon="target" />
          </Reveal>
          <Reveal delay={120}>
            <StatCard label="Best score" value={bestScore} suffix="%" icon="trendingUp" />
          </Reveal>
          <Reveal delay={180}>
            <StatCard label="Questions answered" value={totalAnswered} icon="circleHelp" />
          </Reveal>
        </div>

        {/* ── Empty state ── */}
        {!hasData && (
          <Reveal className="mt-10">
            <EmptyState />
          </Reveal>
        )}

        {hasData && (
          <>
            {/* ── AI Coach Banner ── */}
            <section className="mt-8">
              <Reveal>
                <Link
                  href="/coach"
                  className="group flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-purple-500/30 bg-purple-500/[0.04] p-5 md:p-6 shadow-xl shadow-purple-900/10 transition-colors hover:bg-purple-500/[0.08]"
                >
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-purple-500/20 text-purple-300 ring-1 ring-inset ring-purple-400/30">
                      <Sparkles className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 className="text-[17px] font-bold text-white group-hover:text-purple-300 transition-colors">
                        🧠 Your AI Coach
                      </h2>
                      <p className="mt-0.5 text-sm text-slate-400">
                        See what you should improve next.
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center justify-center rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all group-hover:bg-purple-500 group-hover:scale-105">
                    View Insights
                    <ChevronRight className="ml-1.5 h-4 w-4" />
                  </div>
                </Link>
              </Reveal>
            </section>

            {/* ── Performance Trend ── */}
            <section className="mt-8">
              <Reveal>
                <SectionHeading
                  title="Performance Over Time"
                  subtitle="Your readiness score across completed interviews."
                />
                {trendData.length < 2 ? (
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.1] bg-[#0D1424]/60 px-6 py-12 text-center">
                    <MessageSquare className="mx-auto mb-3 h-8 w-8 text-slate-500" aria-hidden="true" />
                    <p className="text-sm text-slate-400">
                      Complete another interview to see your performance trend.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-white/[0.08] bg-[#0D1424] p-5 md:p-7">
                    <ProgressChart data={trendData} />
                  </div>
                )}
              </Reveal>
            </section>

            {/* ── Skill Breakdown + Insights ── */}
            <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Skill Breakdown */}
              <Reveal delay={0}>
                <div className="flex h-full flex-col rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 md:p-7">
                  <h2 className="mb-5 text-xl font-semibold tracking-tight text-white">Skill Breakdown</h2>
                  <div className="flex flex-1 flex-col justify-center gap-6">
                    <PerformanceBar label="Technical" value={avgTech ?? 0} delay={0} />
                    <PerformanceBar label="Communication" value={avgComm ?? 0} delay={80} />
                    <PerformanceBar label="Confidence" value={avgConf ?? 0} delay={160} />
                    <PerformanceBar label="Relevance" value={avgRel ?? 0} delay={240} />
                  </div>
                </div>
              </Reveal>

              {/* Insights */}
              <Reveal delay={80}>
                <div className="flex h-full flex-col rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 md:p-7">
                  <h2 className="mb-5 text-xl font-semibold tracking-tight text-white">Performance Insights</h2>
                  <div className="flex flex-1 flex-col justify-center gap-4">
                    {/* Strongest */}
                    {strongest && (
                      <div className="flex items-start gap-3.5 rounded-xl bg-emerald-500/[0.07] p-4 ring-1 ring-inset ring-emerald-400/20">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400">
                          <Star className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-emerald-400">
                            Strongest Area
                          </p>
                          <p className="mt-0.5 text-[15px] font-semibold text-white">
                            {strongest.key}{" "}
                            <span className="font-bold text-emerald-300">{strongest.val}%</span>
                          </p>
                        </div>
                      </div>
                    )}
                    {/* Weakest */}
                    {weakest && weakest.key !== strongest?.key && (
                      <div className="flex items-start gap-3.5 rounded-xl bg-amber-500/[0.07] p-4 ring-1 ring-inset ring-amber-400/20">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-400">
                          <TrendingUp className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">
                            Needs Improvement
                          </p>
                          <p className="mt-0.5 text-[15px] font-semibold text-white">
                            {weakest.key}{" "}
                            <span className="font-bold text-amber-300">{weakest.val}%</span>
                          </p>
                        </div>
                      </div>
                    )}
                    {/* Latest score */}
                    {latestScore !== null && (
                      <div className="flex items-start gap-3.5 rounded-xl bg-white/[0.03] p-4 ring-1 ring-inset ring-white/[0.08]">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-purple-500/10 text-purple-400">
                          <Target className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">
                              Latest Score
                            </p>
                            <p className="mt-0.5 text-[15px] font-semibold text-white">
                              <span className={`font-bold ${scoreColor(latestScore)}`}>
                                {latestScore}%
                              </span>
                            </p>
                          </div>
                          {scoreChange !== null && (
                            <span
                              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${
                                scoreChange >= 0
                                  ? "bg-emerald-500/10 text-emerald-300 ring-emerald-400/25"
                                  : "bg-rose-500/10 text-rose-300 ring-rose-400/25"
                              }`}
                            >
                              {scoreChange >= 0 ? "+" : ""}
                              {scoreChange}% from previous
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
              
              <Reveal delay={160} className="lg:col-span-2">
                <FocusAreaProgress focusAreasData={focusAreasData} />
              </Reveal>
            </section>

            {/* ── Best Performance ── */}
            {bestInterview && (
              <section className="mt-8">
                <Reveal>
                  <SectionHeading title="Best Performance" />
                  <div className="overflow-hidden rounded-2xl border border-purple-500/20 bg-[#0D1424]">
                    <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between md:p-7">
                      <div className="flex items-center gap-4">
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 text-purple-300 ring-1 ring-inset ring-purple-400/25">
                          <Star className="h-6 w-6" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[17px] font-semibold text-white">
                            {bestInterview.role}
                          </p>
                          <p className="mt-0.5 text-sm text-slate-400">
                            {human(bestInterview.interviewType)} · {human(bestInterview.difficulty)} ·{" "}
                            {fmtDate(bestInterview.completedAt ?? bestInterview.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-5">
                        <div className="text-right">
                          <p className="text-[32px] font-bold leading-none tabular-nums text-gradient-purple">
                            {bestScore}%
                          </p>
                          <p className="mt-1 text-[11px] uppercase tracking-wider text-slate-500">
                            Best Score
                          </p>
                        </div>
                        <Link
                          href={`/interview/${bestInterview.id}/result`}
                          className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/[0.06] px-4 text-sm font-semibold text-slate-100 ring-1 ring-inset ring-white/[0.1] transition-all duration-150 hover:bg-white/[0.1] hover:text-white hover:ring-purple-400/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70"
                        >
                          View Result
                          <ArrowRight className="h-4 w-4" aria-hidden="true" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </section>
            )}

            {/* ── Recent Interviews ── */}
            <section className="mt-8">
              <Reveal>
                <SectionHeading
                  title="Recent Interviews"
                  subtitle="Your latest completed sessions."
                  action={
                    <Link
                      href="/interviews"
                      className="group inline-flex items-center gap-1.5 rounded text-sm font-semibold text-purple-300 transition-colors hover:text-purple-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70"
                    >
                      View All
                      <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
                    </Link>
                  }
                />
                <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0D1424]">
                  <ul className="divide-y divide-white/[0.06]">
                    {recent.map((item) => {
                      const reminder = remindersMap.get(item.id);
                      return (
                      <li key={item.id}>
                        <div className="group relative flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-white/[0.03] sm:px-5 md:flex-row md:items-center md:justify-between md:gap-6">
                          <Link
                            href={item.status === "COMPLETED" 
                              ? `/interview/${item.id}/result` 
                              : (item.interviewType === "FOCUS_PRACTICE" ? `/focus-practice/${item.id}` : `/interview/${item.id}`)}
                            className="absolute inset-0 z-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-400/60"
                            aria-label={`View ${item.role} interview`}
                          />
                          <div className="flex min-w-0 items-center gap-3.5 z-10 pointer-events-none">
                            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/[0.04] text-purple-300 ring-1 ring-inset ring-white/[0.06]">
                              <Activity className="h-4 w-4" aria-hidden="true" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-[15px] font-semibold leading-5 text-white">
                                  {item.role}
                                </p>
                                {item.source === "AI_COACH" && (
                                  <span className="flex items-center gap-1 rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-purple-300">
                                    <Sparkles className="h-3 w-3" /> AI
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13px] text-slate-400">
                                <span className="font-medium text-slate-300">{human(item.interviewType)}</span>
                                <span className="text-slate-600" aria-hidden="true">•</span>
                                <span>{human(item.difficulty)}</span>
                                <span className="text-slate-600" aria-hidden="true">•</span>
                                <span className="inline-flex items-center gap-1">
                                  <CalendarDays className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
                                  {fmtDate(item.date)}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center justify-between gap-4 md:justify-end md:gap-7 z-10">
                            {item.status !== "COMPLETED" ? (
                              <div className="text-right mr-2 flex flex-col justify-center pointer-events-none">
                                <p className="text-[13px] font-bold text-white leading-5">
                                  Q {item.currentQuestionIndex !== undefined ? item.currentQuestionIndex + 1 : 1} / {item.questionCount || "?"}
                                </p>
                                <p className="text-[11px] text-purple-400 mt-0.5">
                                  {item.remainingSeconds ? formatTime(item.remainingSeconds) : "--:--"}
                                </p>
                              </div>
                            ) : (
                              <div className="text-left pointer-events-none">
                                <p
                                  className={`text-lg font-bold leading-6 tabular-nums ${
                                    item.score !== null ? scoreColor(item.score) : "text-slate-500"
                                  }`}
                                >
                                  {item.score !== null ? `${item.score}%` : "—"}
                                </p>
                                <p className="text-[11px] uppercase tracking-wider text-slate-500">Score</p>
                              </div>
                            )}
                            <StatusBadge status={item.status} />
                            {item.status !== "COMPLETED" ? (
                              <div className="flex items-center gap-3">
                                {(item.status === "PAUSED" || item.status === "IN_PROGRESS" || (item.status === "DRAFT" && item.currentQuestionIndex !== undefined)) && (
                                  <ReminderButton 
                                    interviewId={item.id} 
                                    interviewType={item.interviewType} 
                                    role={item.role}
                                    existingReminder={reminder}
                                  />
                                )}
                                <Link 
                                  href={item.interviewType === "FOCUS_PRACTICE" ? `/focus-practice/${item.id}` : `/interview/${item.id}`}
                                  className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-semibold text-emerald-400 ring-1 ring-inset ring-emerald-400/20 transition-all hover:bg-emerald-500/25 relative z-20 pointer-events-auto"
                                >
                                  ▶ Resume
                                </Link>
                              </div>
                            ) : (
                              <ChevronRight
                                className="h-4 w-4 text-slate-600 transition-colors group-hover:text-purple-300 pointer-events-none"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                        </div>
                      </li>
                      );
                    })}
                  </ul>
                </div>
              </Reveal>
            </section>

            {/* ── Role + Type Performance (side by side if data) ── */}
            {(rolePerf.length >= 2 || typePerf.length >= 2) && (
              <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {rolePerf.length >= 2 && (
                  <Reveal delay={0}>
                    <div className="h-full rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 md:p-7">
                      <h2 className="mb-5 text-xl font-semibold tracking-tight text-white">Performance by Role</h2>
                      <div className="flex flex-col gap-4">
                        {rolePerf.map(({ role, score }) => (
                          <div key={role}>
                            <div className="mb-1.5 flex min-w-0 items-center justify-between gap-3">
                              <span className="min-w-0 truncate text-sm font-medium text-slate-300">{role}</span>
                              <span className="shrink-0 text-sm font-bold text-white tabular-nums">{score}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-violet-500"
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                )}

                {typePerf.length >= 2 && (
                  <Reveal delay={80}>
                    <div className="h-full rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 md:p-7">
                      <h2 className="mb-5 text-xl font-semibold tracking-tight text-white">Performance by Interview Type</h2>
                      <div className="flex flex-col gap-4">
                        {typePerf.map(({ type, score }) => (
                          <div key={type}>
                            <div className="mb-1.5 flex items-center justify-between gap-3">
                              <span className="text-sm font-medium text-slate-300">{human(type)}</span>
                              <span className="text-sm font-bold text-white tabular-nums">{score}%</span>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06]">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-sky-600 to-blue-500"
                                style={{ width: `${score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                )}
              </section>
            )}

            {/* ── Recommended Focus ── */}
            {recommendation && (
              <section className="mt-8 pb-4">
                <Reveal>
                  <SectionHeading title="Recommended Focus" />
                  <div className="flex gap-4 rounded-2xl border border-amber-400/20 bg-amber-500/[0.04] p-6 md:p-7">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-amber-500/10 text-amber-400">
                      <Lightbulb className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[15px] font-semibold text-white">{recommendation.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-400">{recommendation.desc}</p>
                      <Link
                        href="/practice"
                        className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-amber-500/10 px-4 text-sm font-semibold text-amber-200 ring-1 ring-inset ring-amber-400/25 transition-all duration-150 hover:bg-amber-500/20 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70"
                      >
                        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                        Practice Now
                      </Link>
                    </div>
                  </div>
                </Reveal>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
