"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2, Layout, Layers, Target, Clock, AlertTriangle, ArrowLeft,
  BrainCircuit, TrendingUp, MessageSquare, ShieldCheck, PenTool,
  CheckCircle, Lightbulb, ChevronDown, ChevronUp, Star
} from "lucide-react";
import Link from "next/link";

/* ─── score color ─── */
const scoreColor = (n: number) =>
  n >= 80 ? "text-emerald-400" : n >= 60 ? "text-amber-400" : "text-rose-400";

const scoreLabel = (n: number) =>
  n >= 80 ? "Highly Prepared" : n >= 60 ? "Getting There" : "Needs Practice";

/* ─── mini horizontal bar ─── */
function ScoreBar({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm text-slate-400">
          <Icon className="h-4 w-4" />
          {label}
        </span>
        <span className={`text-sm font-bold tabular-nums ${scoreColor(value)}`}>
          {value}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full transition-[width] duration-700 ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

/* ─── collapsible question review row ─── */
function QuestionRow({ q, index }: { q: any; index: number }) {
  const [open, setOpen] = useState(false);
  const skipped = q.answer?.answerText === "[SKIPPED]";
  const score = q.answer?.evaluation?.overallScore;

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#111A2B]">
      {/* Header (always visible) */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-4 flex items-start gap-3 text-left transition-colors hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-400/60"
        aria-expanded={open}
      >
        <div className="mt-0.5 flex shrink-0 flex-col items-start gap-1 w-24">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Q{index + 1}
          </span>
          {q.isFollowUp && (
            <span className="rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-300 ring-1 ring-inset ring-purple-400/25">
              Follow-Up
            </span>
          )}
        </div>
        <p className="min-w-0 flex-1 break-words text-[15px] font-medium leading-snug text-white">
          {q.question}
        </p>
        <div className="ml-3 flex shrink-0 items-center gap-2">
          {q.topic && (
            <span className="hidden sm:inline-block rounded-md bg-white/[0.04] px-2 py-0.5 text-xs text-slate-400">
              {q.topic}
            </span>
          )}
          {skipped ? (
            <span className="rounded-full bg-slate-500/10 px-2.5 py-1 text-xs font-medium text-slate-400 ring-1 ring-inset ring-white/10">
              Skipped
            </span>
          ) : score !== undefined ? (
            <span className={`text-sm font-bold tabular-nums ${scoreColor(score)}`}>
              {score}%
            </span>
          ) : null}
          {open ? (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </div>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-white/[0.06] px-5 pb-6 pt-5 space-y-5">
          {/* Answer */}
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Your Answer
            </p>
            {skipped ? (
              <span className="inline-block rounded-full bg-slate-500/10 px-3 py-1 text-sm italic text-slate-400">
                Skipped
              </span>
            ) : (
              <p className="break-words rounded-xl border border-white/[0.06] bg-white/[0.03] p-4 text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                {q.answer?.answerText || "No answer provided"}
              </p>
            )}
          </div>

          {/* AI Feedback */}
          {!skipped && q.answer?.evaluation && (
            <div className="space-y-4">
              {/* Mini scores */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[
                  { key: "technicalScore", label: "Technical" },
                  { key: "communicationScore", label: "Communication" },
                  { key: "clarityScore", label: "Clarity" },
                  { key: "confidenceScore", label: "Confidence" },
                  { key: "relevanceScore", label: "Relevance" },
                  { key: "grammarScore", label: "Grammar" },
                ].map(({ key, label }) => {
                  const val = q.answer.evaluation[key];
                  return val !== undefined ? (
                    <div key={key} className="rounded-lg bg-white/[0.03] px-3 py-2 text-center ring-1 ring-inset ring-white/[0.06]">
                      <p className={`text-lg font-bold tabular-nums ${scoreColor(val)}`}>{val}</p>
                      <p className="text-[11px] text-slate-500">{label}</p>
                    </div>
                  ) : null;
                })}
              </div>

              {/* Strengths */}
              {q.answer.evaluation.strengths?.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                    Strengths
                  </p>
                  <ul className="space-y-1">
                    {q.answer.evaluation.strengths.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                        <span className="break-words">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {q.answer.evaluation.suggestions?.length > 0 && (
                <div>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                    Suggestions
                  </p>
                  <ul className="space-y-1">
                    {q.answer.evaluation.suggestions.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                        <span className="break-words">{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Ideal answer */}
              {q.answer.evaluation.idealAnswer && (
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Ideal Answer Approach
                  </p>
                  <p className="break-words text-sm leading-relaxed text-slate-400 whitespace-pre-wrap">
                    {q.answer.evaluation.idealAnswer}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── page ─── */
export default function InterviewResultPage() {
  const { id } = useParams();
  const router = useRouter();

  const [interview, setInterview] = useState<any>(null);
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [error, setError] = useState("");

  const fetchInterview = async () => {
    try {
      const res = await fetch(`/api/interviews/${id}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (data.interview.status !== "COMPLETED") {
        router.push(`/interview/${id}`);
        return;
      }

      setInterview(data.interview);

      if (data.interview.report) {
        setReport(data.interview.report);
        setLoading(false);
      } else {
        triggerEvaluation();
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const triggerEvaluation = async () => {
    setEvaluating(true);
    try {
      const res = await fetch(`/api/interviews/${id}/evaluate`, { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const refresh = await fetch(`/api/interviews/${id}`);
      const refreshedData = await refresh.json();
      setInterview(refreshedData.interview);
      setReport(refreshedData.interview.report);
    } catch (err: any) {
      setError(err.message || "Evaluation failed");
    } finally {
      setEvaluating(false);
      setLoading(false);
    }
  };

  useEffect(() => { fetchInterview(); }, [id]);

  /* Loading / evaluating */
  if (loading || evaluating) {
    return (
      <div className="min-h-screen bg-[#050814] flex flex-col items-center justify-center text-white p-4">
        <BrainCircuit className="mb-5 h-14 w-14 animate-pulse text-purple-400" />
        <h2 className="mb-2 text-2xl font-bold">Analyzing Your Interview…</h2>
        <p className="max-w-md text-center text-sm text-slate-400">
          Our AI is evaluating your technical accuracy, communication skills, and generating
          personalized feedback. This usually takes 10–20 seconds.
        </p>
      </div>
    );
  }

  /* Error */
  if (error || !interview) {
    return (
      <div className="min-h-screen bg-[#050814] flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0D1424] p-8 text-center shadow-xl">
          <AlertTriangle className="mx-auto mb-4 h-14 w-14 text-red-400" />
          <h2 className="mb-2 text-xl font-bold text-white">Error Loading Results</h2>
          <p className="mb-6 text-sm text-rose-300">{error || "Could not load report."}</p>
          <div className="flex gap-3">
            <button
              onClick={triggerEvaluation}
              className="flex-1 rounded-xl bg-white/[0.06] py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/[0.1] transition-colors hover:bg-white/[0.1]"
            >
              Retry Evaluation
            </button>
            <Link
              href="/interviews"
              className="flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
            >
              Back to History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  let answered = 0, skipped = 0;
  interview.questions.forEach((q: any) => {
    if (q.answer) {
      if (q.answer.answerText === "[SKIPPED]") skipped++;
      else answered++;
    }
  });

  const durationStr =
    interview.completedAt && interview.startedAt
      ? Math.floor(
          (new Date(interview.completedAt).getTime() - new Date(interview.startedAt).getTime()) /
            60000
        )
      : interview.durationMinutes;

  return (
    <div className="w-full">
      <div className="relative mx-auto w-full space-y-6">

        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-purple-300/90">
              InterviewAI · Results
            </p>
            <h1 className="text-balance text-[26px] font-bold leading-tight tracking-tight text-white sm:text-3xl">
              Interview Performance Report
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              {interview.role} · {interview.interviewType} · {interview.difficulty}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link
              href="/interviews"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/[0.05] px-4 text-sm font-semibold text-slate-200 ring-1 ring-inset ring-white/[0.1] transition-colors hover:bg-white/[0.1]"
            >
              <ArrowLeft className="h-4 w-4" />
              History
            </Link>
            <Link
              href="/practice"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-4 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition-all hover:brightness-110"
            >
              Practice Again
            </Link>
          </div>
        </header>

        {/* Overview row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Answered", value: answered, icon: CheckCircle },
            { label: "Skipped", value: skipped, icon: Target },
            { label: "Duration", value: `${durationStr}m`, icon: Clock },
            { label: "Questions", value: interview.questions.length, icon: Layers },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-[#0D1424] p-4"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-purple-500/10 text-purple-300 ring-1 ring-inset ring-white/[0.06]">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {label}
                </p>
                <p className="text-lg font-bold text-white tabular-nums">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Score + Breakdown */}
        {report && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Readiness donut */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-900/[0.08] p-8 text-center lg:col-span-1">
              <p className="mb-5 text-[12px] font-semibold uppercase tracking-widest text-slate-400">
                Readiness Score
              </p>
              <div className="relative h-44 w-44">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r="45"
                    fill="none" strokeWidth="8"
                    stroke="rgba(255,255,255,0.06)"
                  />
                  <circle
                    cx="50" cy="50" r="45"
                    fill="none" strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * (report.readinessScore || 0)) / 100}
                    className={`transition-all duration-1000 ease-out ${
                      report.readinessScore >= 80
                        ? "stroke-emerald-500"
                        : report.readinessScore >= 60
                          ? "stroke-amber-400"
                          : "stroke-rose-500"
                    }`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black tabular-nums text-white">
                    {report.readinessScore || 0}
                  </span>
                  <span className="text-xs text-slate-500">/ 100</span>
                </div>
              </div>
              <p className={`mt-4 text-lg font-semibold ${scoreColor(report.readinessScore || 0)}`}>
                {scoreLabel(report.readinessScore || 0)}
              </p>
              <p className="mt-1 text-xs text-slate-500">Overall readiness</p>
            </div>

            {/* Skill breakdown */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 lg:col-span-2">
              <h2 className="mb-5 text-lg font-semibold text-white">Skill Breakdown</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ScoreBar
                  label="Technical"
                  value={report.technicalScore || 0}
                  icon={PenTool}
                  color="bg-gradient-to-r from-blue-600 to-sky-500"
                />
                <ScoreBar
                  label="Communication"
                  value={report.communicationScore || 0}
                  icon={MessageSquare}
                  color="bg-gradient-to-r from-emerald-600 to-green-500"
                />
                <ScoreBar
                  label="Confidence"
                  value={report.confidenceScore || 0}
                  icon={ShieldCheck}
                  color="bg-gradient-to-r from-purple-600 to-violet-500"
                />
                <ScoreBar
                  label="Relevance"
                  value={report.relevanceScore || 0}
                  icon={Target}
                  color="bg-gradient-to-r from-amber-500 to-yellow-400"
                />
              </div>
            </div>
          </div>
        )}

        {/* Strengths + Improvements */}
        {report && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                Key Strengths
              </h3>
              {report.strengths?.length > 0 ? (
                <ul className="space-y-2.5">
                  {(report.strengths as string[]).map((s, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                      <span className="break-words text-sm leading-relaxed text-slate-300">{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm italic text-slate-500">Not enough data collected.</p>
              )}
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <Lightbulb className="h-5 w-5 text-amber-400" />
                Areas for Improvement
              </h3>
              {report.improvements?.length > 0 ? (
                <ul className="space-y-2.5">
                  {(report.improvements as string[]).map((imp, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                      <span className="break-words text-sm leading-relaxed text-slate-300">{imp}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm italic text-slate-500">Not enough data collected.</p>
              )}
            </div>
          </div>
        )}

        {/* Question review */}
        <section>
          <h2 className="mb-4 text-xl font-semibold text-white">Detailed Answer Review</h2>
          <p className="mb-4 text-sm text-slate-500">
            Click any question to expand the full feedback.
          </p>
          <div className="space-y-3">
            {interview.questions.map((q: any, i: number) => (
              <QuestionRow key={q.id} q={q} index={i} />
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="flex flex-wrap gap-3 pb-4">
          <Link
            href="/progress"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-white/[0.05] px-5 text-sm font-semibold text-slate-200 ring-1 ring-inset ring-white/[0.1] transition-colors hover:bg-white/[0.1]"
          >
            <TrendingUp className="h-4 w-4" />
            View Progress
          </Link>
          <Link
            href="/practice"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition-all hover:brightness-110"
          >
            <Star className="h-4 w-4" />
            Practice Again
          </Link>
        </div>

      </div>
    </div>
  );
}
