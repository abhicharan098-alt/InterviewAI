import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Loader2, WifiOff } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { Reveal } from "@/components/dashboard/Reveal";
import { TryAgainButton } from "@/components/dashboard/TryAgainButton";
import { calculateReadiness } from "@/lib/preparation/ReadinessEngine";
import { retryAsync } from "@/lib/server/retry";

import { PreparationCard } from "@/components/dashboard/PreparationCard";
import { SkillMatrix } from "@/components/dashboard/SkillMatrix";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { RecentInterviews } from "@/components/dashboard/RecentInterviews";
import { RecommendedPractice } from "@/components/dashboard/RecommendedPractice";
import { DailyTip } from "@/components/dashboard/DailyTip";
import { FocusAreasCard } from "@/components/dashboard/FocusAreasCard";
import { CoachDashboardCard } from "@/components/dashboard/CoachDashboardCard";
import { PreparationMomentum } from "@/components/dashboard/PreparationMomentum";
import { QuickDrill } from "@/components/dashboard/QuickDrill";
import { DailyStreak } from "@/components/dashboard/DailyStreak";
import { DashboardGreeting } from "@/components/dashboard/DashboardGreeting";
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

type DashboardData = {
  greetingName: string;
  completed: number;
  answered: number;
  avgScore: number | null;
  bestScore: number | null;
  readiness: number | null;
  technical: number | null;
  communication: number | null;
  confidence: number | null;
  relevance: number | null;
  targetRole: string | null;
  readinessResult: any;
  recent: RecentInterview[];
  chartData: { date: string; score: number; role: string }[];
  focusAreas: string[];
};

const average = (nums: number[]): number | null =>
  nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : null;

function ErrorState() {
  return (
    <div className="flex w-full flex-col items-center justify-center py-24 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.04] text-slate-400 ring-1 ring-inset ring-white/[0.06]">
        <WifiOff className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="mt-5 text-lg font-semibold text-white">
        Unable to load your dashboard data.
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        Something went wrong while fetching your interview activity. Your account is
        safe — please try again.
      </p>
      <div className="mt-6">
        <TryAgainButton />
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  let data: DashboardData | null = null;
  let failed = false;

  try {
    const [completed, answered, reportRows, recentRows, profile] = await retryAsync(
      async () =>
        Promise.all([
          prisma.interview.count({ where: { userId, status: "COMPLETED" } }),
          prisma.interviewAnswer.count({
            where: {
              answerText: { not: "[SKIPPED]" },
              question: { interview: { userId } },
            },
          }),
          prisma.interview.findMany({
            where: { 
              userId, 
              status: "COMPLETED", 
              report: { isNot: null },
              completedAt: {
                gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
              }
            },
            select: {
              createdAt: true,
              completedAt: true,
              role: true,
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
            orderBy: { completedAt: "desc" },
            take: 50
          }),
          prisma.interview.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            include: { report: { select: { overallScore: true } } },
            take: 6,
          }),
          prisma.profile.findUnique({ where: { userId } }),
        ])
    );

    const reports = reportRows
      .map((r) => r.report)
      .filter((r): r is NonNullable<typeof r> => r !== null);

    const name = session.user.name?.trim() || session.user.email?.split("@")[0] || "there";
    const firstName = name.split(/[\s-]+/)[0] || "there";

    const scores = reports.map((r) => r.overallScore);

    const chartData = reportRows.map((r) => ({
      date: (r.completedAt ?? r.createdAt).toISOString(),
      score: r.report?.overallScore || 0,
      role: r.role
    }));

    data = {
      greetingName: firstName,
      completed,
      answered,
      avgScore: average(scores),
      bestScore: scores.length ? Math.max(...scores) : null,
      readiness: average(reports.map((r) => r.readinessScore)),
      technical: average(reports.map((r) => r.technicalScore)),
      communication: average(reports.map((r) => r.communicationScore)),
      confidence: average(reports.map((r) => r.confidenceScore)),
      relevance: average(reports.map((r) => r.relevanceScore)),
      targetRole: profile?.targetRole ?? null,
      recent: recentRows.map((i) => ({
        id: i.id,
        role: i.role,
        interviewType: i.interviewType,
        difficulty: i.difficulty,
        date: i.completedAt ?? i.createdAt,
        score: i.report?.overallScore ?? null,
        status: i.status,
        source: i.source,
      })),
      chartData,
      readinessResult: calculateReadiness(reports.map(r => ({
        technicalScore: r.technicalScore,
        communicationScore: r.communicationScore,
        confidenceScore: r.confidenceScore,
        relevanceScore: r.relevanceScore,
        clarityScore: 0,
        overallScore: r.overallScore,
        role: undefined,
      })), profile?.targetRole),
      focusAreas: profile?.focusAreas || [],
    };
  } catch (error) {
    console.error("Dashboard data load failed:", error);
    failed = true;
  }

  if (failed || !data) {
    return <ErrorState />;
  }

  return (
    <div className="w-full">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <Reveal className="shrink-0">
          <header>
            <DashboardGreeting userName={data.greetingName} />
            <p className="mt-1 text-[15px] text-slate-400">
              Your interview preparation at a glance.
            </p>
          </header>
        </Reveal>
        
        <Reveal delay={100} className="w-full lg:max-w-3xl flex-1 flex justify-end">
          <DailyStreak />
        </Reveal>
      </div>

      {/* Dashboard Grid Layout - 12 Columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 mb-6">
        {/* ROW 1: Analytics & Trends */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Reveal delay={0}>
            <PreparationCard 
              targetRole={data.targetRole}
              readinessScore={data.readiness || 0}
            />
          </Reveal>
          <div className="grid grid-cols-2 gap-6">
            <Reveal delay={60}>
              <StatCard label="Avg Score" value={data.avgScore} suffix="%" icon="target" />
            </Reveal>
            <Reveal delay={120}>
              <StatCard label="Best Score" value={data.bestScore} suffix="%" icon="trendingUp" />
            </Reveal>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col">
          <Reveal delay={180} className="flex-1 flex flex-col h-full">
            <PerformanceChart data={data.chartData} />
          </Reveal>
        </div>
      </div>

      {/* Bottom Masonry Layout - 3 Columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
        {/* Column 1 */}
        <div className="flex flex-col gap-6">
          <Reveal delay={240}>
            <SkillMatrix 
              technical={data.technical || 0}
              communication={data.communication || 0}
              confidence={data.confidence || 0}
              relevance={data.relevance || 0}
            />
          </Reveal>
          <Reveal delay={420}>
            <FocusAreasCard focusAreas={data.focusAreas} />
          </Reveal>
        </div>

        {/* Column 2 */}
        <div className="flex flex-col gap-6">
          <Reveal delay={300}>
            <RecentInterviews interviews={data.recent} />
          </Reveal>
          <Reveal delay={450}>
            <CoachDashboardCard />
          </Reveal>
          <Reveal delay={540}>
            <PreparationMomentum completed={data.completed || 0} />
          </Reveal>
        </div>

        {/* Column 3 */}
        <div className="flex flex-col gap-6">
          <Reveal delay={360}>
            <RecommendedPractice 
              title={data.readinessResult.recommendations[0]?.title || "Start Practicing"}
              description={data.readinessResult.recommendations[0]?.description || "Complete your first interview to unlock personalized recommendations."}
              actionText={data.readinessResult.recommendations[0]?.action || "Practice Now"}
              href={data.readinessResult.recommendations[0]?.href || "/practice"}
            />
          </Reveal>
          <Reveal delay={480}>
            <DailyTip />
          </Reveal>
          <Reveal delay={600}>
            <QuickDrill />
          </Reveal>
        </div>
      </div>
    </div>
  );
}
