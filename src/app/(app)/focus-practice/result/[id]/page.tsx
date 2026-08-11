"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Reveal } from "@/components/dashboard/Reveal";
import { 
  Target, 
  Brain, 
  ArrowRight, 
  ChevronDown,
  ChevronUp,
  LayoutDashboard,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Loader2
} from "lucide-react";

export default function FocusPracticeResultPage() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedQs, setExpandedQs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await fetch(`/api/focus-practice/${id}/result`);
        const json = await res.json();
        
        if (!res.ok) {
          throw new Error(json.error || "Failed to load report");
        }
        
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResult();
  }, [id]);

  const toggleQuestion = (qId: string) => {
    setExpandedQs(prev => ({ ...prev, [qId]: !prev[qId] }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400 mb-4" />
        <p className="text-slate-400">Preparing your Focus Practice report...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Unable to load your Focus Practice report</h2>
        <p className="text-slate-400 mb-6">{error || "The session might be incomplete or missing."}</p>
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.reload()}
            className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
          >
            Try Again
          </button>
          <Link 
            href="/focus-areas"
            className="rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-500"
          >
            Back to Focus Areas
          </Link>
        </div>
      </div>
    );
  }

  const { report, questions, interview } = data;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Reveal>
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 ring-1 ring-inset ring-purple-500/30">
            <Target className="h-8 w-8 text-purple-400" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">Focus Practice Complete</h1>
          <p className="text-slate-400">Here&apos;s how you performed across the skills you practiced.</p>
        </div>

        {/* Top Summary Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 text-center">
            <div className="text-4xl font-bold text-emerald-400 mb-1">{report.overallScore}%</div>
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Overall Score</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 text-center">
            <div className="text-4xl font-bold text-white mb-1">{report.questionsAnswered}</div>
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Questions Answered</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 text-center">
            <div className="text-4xl font-bold text-slate-500 mb-1">{report.questionsSkipped}</div>
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Questions Skipped</div>
          </div>
          <div className="rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 text-center">
            <div className="text-4xl font-bold text-white mb-1">{report.focusAreasPracticed}</div>
            <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">Focus Areas Practiced</div>
          </div>
        </div>

        {/* Middle Section: Progress Bars & AI Feedback */}
        <div className="mb-8 grid gap-8 lg:grid-cols-2">
          {/* Per-Focus-Area Results */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 md:p-8">
            <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
              <Brain className="h-5 w-5 text-purple-400" />
              Skill Breakdown
            </h2>
            <div className="space-y-6">
              {Object.entries(report.focusAreaScores).map(([area, stat]: any) => (
                <div key={area}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-medium text-slate-200">{area}</span>
                    <span className="font-bold text-white">{stat.count > 0 ? `${stat.score}%` : "No data"}</span>
                  </div>
                  <div className="h-3 w-full overflow-hidden rounded-full bg-white/5">
                    {stat.count > 0 ? (
                      <div 
                        className={`h-full rounded-full transition-all ${stat.score >= 70 ? 'bg-emerald-500' : stat.score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} 
                        style={{ width: `${stat.score}%` }}
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-800/50" />
                    )}
                  </div>
                  {stat.count === 0 && (
                    <p className="mt-1 text-xs text-slate-500">Not enough data yet</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Feedback & Highlights */}
          <div className="flex flex-col gap-6">
            <div className="flex gap-4">
              <div className="flex-1 rounded-2xl border border-white/[0.08] bg-[#0D1424] p-5">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  <TrendingUp className="h-4 w-4" /> Strongest Area
                </div>
                <div className="text-lg font-bold text-white">
                  {report.strongestArea ? `${report.strongestArea.name} — ${report.strongestArea.score}%` : "N/A"}
                </div>
              </div>
              <div className="flex-1 rounded-2xl border border-white/[0.08] bg-[#0D1424] p-5">
                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400">
                  <TrendingDown className="h-4 w-4" /> Needs Improvement
                </div>
                <div className="text-lg font-bold text-white">
                  {report.weakestArea ? `${report.weakestArea.name} — ${report.weakestArea.score}%` : "N/A"}
                </div>
              </div>
            </div>

            <div className="flex-1 rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 md:p-8">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-bold text-white">
                <Target className="h-5 w-5 text-purple-400" />
                Actionable AI Feedback
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-slate-300">What you're doing well</h3>
                  <ul className="space-y-2">
                    {report.feedback.strengths.length > 0 ? report.feedback.strengths.map((str: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-400">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                        <span>{str}</span>
                      </li>
                    )) : (
                      <li className="text-sm text-slate-500">Not enough data to determine strengths.</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold text-slate-300">What to improve</h3>
                  <ul className="space-y-2">
                    {report.feedback.weaknesses.length > 0 ? report.feedback.weaknesses.map((wk: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-400">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                        <span>{wk}</span>
                      </li>
                    )) : (
                      <li className="text-sm text-slate-500">Not enough data to determine weaknesses.</li>
                    )}
                  </ul>
                </div>

                <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-4">
                  <div className="mb-2 flex items-center gap-2 font-semibold text-purple-300">
                    <Lightbulb className="h-4 w-4 text-purple-400" /> Recommended next step
                  </div>
                  <p className="text-sm text-purple-200/80 leading-relaxed">
                    {report.feedback.recommendedNextStep}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Question Review */}
        <div className="mb-12">
          <h2 className="mb-6 text-xl font-bold text-white">Question Review</h2>
          <div className="space-y-4">
            {questions.map((q: any) => (
              <div key={q.id} className="rounded-2xl border border-white/[0.08] bg-[#0D1424] overflow-hidden transition-all hover:border-white/[0.15]">
                <button
                  onClick={() => toggleQuestion(q.id)}
                  className="flex w-full items-center justify-between p-5 text-left md:p-6"
                >
                  <div className="flex-1 pr-4">
                    <div className="mb-2 flex items-center gap-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Question {q.number}
                      </span>
                      <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-medium text-purple-400 border border-purple-500/20">
                        {q.category}
                      </span>
                      {q.evaluation && (
                        <span className={`text-xs font-bold ${q.evaluation.score >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {q.evaluation.score}%
                        </span>
                      )}
                    </div>
                    <h3 className="text-[15px] font-medium text-slate-200 line-clamp-2">{q.question}</h3>
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/5 text-slate-400">
                    {expandedQs[q.id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>

                {expandedQs[q.id] && (
                  <div className="border-t border-white/[0.05] p-5 md:p-6 bg-white/[0.02]">
                    <div className="mb-6">
                      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Your Answer</h4>
                      <p className="rounded-xl border border-white/5 bg-black/20 p-4 text-sm text-slate-300 leading-relaxed break-words whitespace-pre-wrap">
                        {q.answer || <span className="italic text-slate-500">[Skipped or no answer provided]</span>}
                      </p>
                    </div>

                    {q.evaluation && (
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="rounded-lg border border-white/5 bg-[#050814] p-4">
                          <div className="mb-1 text-xs font-bold text-emerald-400">Strength</div>
                          <p className="text-sm text-slate-300">{q.evaluation.strength}</p>
                        </div>
                        <div className="rounded-lg border border-white/5 bg-[#050814] p-4">
                          <div className="mb-1 text-xs font-bold text-amber-400">Needs Improvement</div>
                          <p className="text-sm text-slate-300">{q.evaluation.weakness}</p>
                        </div>
                        <div className="rounded-lg border border-white/5 bg-[#050814] p-4">
                          <div className="mb-1 text-xs font-bold text-blue-400">Tip</div>
                          <p className="text-sm text-slate-300">{q.evaluation.suggestion}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center border-t border-white/[0.08] pt-10 pb-8">
          <Link
            href="/focus-practice"
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 hover:brightness-110"
          >
            <RefreshCw className="h-4 w-4" />
            Practice Again
          </Link>
          <Link
            href="/focus-areas"
            className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.06] px-8 py-3.5 text-sm font-semibold text-white hover:bg-white/[0.1]"
          >
            <Target className="h-4 w-4" />
            Manage Focus Areas
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 rounded-xl bg-white/[0.03] px-8 py-3.5 text-sm font-semibold text-slate-300 hover:bg-white/[0.08]"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
