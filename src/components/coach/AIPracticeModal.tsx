"use client";

import { useState, useEffect, type CSSProperties } from "react";
import { BrainCircuit, Loader2, Sparkles, Target, ArrowRight, Mic, MessageSquare, Shuffle } from "lucide-react";
import { useRouter } from "next/navigation";
import { AIPracticeConfig } from "@/lib/ai/AICoachPracticeService";

interface AIPracticeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "TECHNICAL" | "RECOMMENDED" | null;
}

type PracticeMode = "VOICE" | "TEXT" | "MIXED";

const MIN_QUESTIONS = 5;
const MAX_QUESTIONS = 50;

const MIN_TIME = 5;
const MAX_TIME = 180;

const snapTime = (v: number): number => {
  const clamped = Math.min(MAX_TIME, Math.max(MIN_TIME, Math.round(v)));
  if (clamped <= 60) return Math.round(clamped / 5) * 5;
  return 60 + Math.round((clamped - 60) / 10) * 10;
};

const formatDuration = (mins: number): string => {
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const rem = mins % 60;
  const unit = hrs === 1 ? "hr" : "hrs";
  return rem === 0 ? `${hrs} ${unit}` : `${hrs} ${unit} ${rem} min`;
};

const SLIDER_THUMB_CLASSES = [
  "h-1.5",
  "w-full",
  "cursor-pointer",
  "appearance-none",
  "rounded-full",
  "bg-transparent",
  "outline-none",
  "group-hover:opacity-100",
  "[&::-webkit-slider-thumb]:h-4",
  "[&::-webkit-slider-thumb]:w-4",
  "[&::-webkit-slider-thumb]:appearance-none",
  "[&::-webkit-slider-thumb]:rounded-full",
  "[&::-webkit-slider-thumb]:bg-white",
  "[&::-webkit-slider-thumb]:border-2",
  "[&::-webkit-slider-thumb]:border-purple-400",
  "[&::-webkit-slider-thumb]:shadow-[0_0_14px_rgba(168,85,247,0.7)]",
  "[&::-webkit-slider-thumb]:transition-transform",
  "[&::-webkit-slider-thumb]:hover:scale-110",
  "[&::-webkit-slider-thumb]:cursor-pointer",
  "[&::-moz-range-thumb]:h-4",
  "[&::-moz-range-thumb]:w-4",
  "[&::-moz-range-thumb]:rounded-full",
  "[&::-moz-range-thumb]:bg-white",
  "[&::-moz-range-thumb]:border-2",
  "[&::-moz-range-thumb]:border-purple-400",
  "[&::-moz-range-thumb]:shadow-[0_0_14px_rgba(168,85,247,0.7)]",
  "[&::-moz-range-thumb]:cursor-pointer",
].join(" ");

export function AIPracticeModal({ open, onOpenChange, mode }: AIPracticeModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<AIPracticeConfig | null>(null);

  const [questions, setQuestions] = useState(10);
  const [time, setTime] = useState(20);
  const [selectedMode, setSelectedMode] = useState<PracticeMode>("VOICE");

  useEffect(() => {
    if (open && mode) {
      setQuestions(10);
      setTime(20);
      setSelectedMode("VOICE");
      generateConfig();
    } else {
      setConfig(null);
      setError(null);
    }
  }, [open, mode]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  const generateConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/coach/practice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to generate practice config");
      setConfig(data.configuration);
    } catch (err: any) {
      setError("AI practice generation is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    if (!config) return;
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: config.role,
          experienceLevel: config.experienceLevel,
          interviewType: config.interviewType,
          difficulty: config.difficulty,
          durationMinutes: time,
          questionCount: questions,
          mode: selectedMode,
          focusAreas: config.focusAreas,
          source: "AI_COACH",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start practice");

      router.push(`/interview/${data.interviewId}`);
    } catch (err: any) {
      setError("Failed to start the interview.");
      setStarting(false);
    }
  };

  const questionsPct = ((questions - MIN_QUESTIONS) / (MAX_QUESTIONS - MIN_QUESTIONS)) * 100;
  const timePct = ((time - MIN_TIME) / (MAX_TIME - MIN_TIME)) * 100;

  const trackStyle = (pct: number): CSSProperties => ({
    background: `linear-gradient(to right, #a855f7 0%, #c084fc ${pct}%, rgba(255,255,255,0.08) ${pct}%, rgba(255,255,255,0.08) 100%)`,
  });

  return open ? (
    <div className="fixed top-0 left-0 z-[9999] flex h-[100dvh] w-[100vw] items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-white overflow-y-auto max-h-[90dvh] relative">
        <button 
          onClick={() => onOpenChange(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"
        >
          <span className="sr-only">Close</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl animate-pulse" />
              <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 p-4 flex items-center justify-center">
                <BrainCircuit className="h-8 w-8 text-white animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Analyzing your performance...</h3>
            <p className="text-slate-400 text-sm">Identifying your focus areas and preparing your personalized interview.</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-red-400 mb-6">{error}</p>
            <button
              onClick={generateConfig}
              className="px-6 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-white font-medium"
            >
              Try Again
            </button>
          </div>
        ) : config ? (
          <div className="p-6 pt-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                {mode === "TECHNICAL" ? <Target className="h-5 w-5 text-white" /> : <Sparkles className="h-5 w-5 text-white" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {mode === "TECHNICAL" ? "Technical Practice" : "Recommended Practice"}
                </h2>
                <p className="text-xs text-purple-400 font-medium tracking-wide uppercase mt-0.5">✨ Prepared specifically for you</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                <p className="text-xs font-semibold text-slate-400 mb-2">Focus Areas</p>
                <div className="flex flex-wrap gap-2">
                  {config.focusAreas.map((area, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-purple-500/10 text-purple-300 text-xs font-medium border border-purple-500/20">
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="capitalize">{config.difficulty.toLowerCase()} difficulty</span>
                <span className="text-slate-700">•</span>
                <span className="capitalize">{config.interviewType.toLowerCase()} type</span>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-5 space-y-6">
              {/* Questions Slider */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Questions</p>
                  <span className="text-3xl font-bold text-white tabular-nums leading-none">{questions}</span>
                </div>
                <input
                  type="range"
                  min={MIN_QUESTIONS}
                  max={MAX_QUESTIONS}
                  step={1}
                  value={questions}
                  onChange={(e) => setQuestions(parseInt(e.target.value, 10))}
                  aria-label="Number of questions"
                  className={SLIDER_THUMB_CLASSES}
                  style={trackStyle(questionsPct)}
                />
                <div className="flex justify-between mt-1.5 text-[11px] text-slate-500">
                  <span>{MIN_QUESTIONS}</span>
                  <span>{MAX_QUESTIONS}</span>
                </div>
              </div>

              {/* Time Limit Slider */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Time Limit</p>
                  <span className="text-2xl font-bold text-purple-300 tabular-nums leading-none">{formatDuration(time)}</span>
                </div>
                <input
                  type="range"
                  min={MIN_TIME}
                  max={MAX_TIME}
                  step={1}
                  value={time}
                  onChange={(e) => setTime(snapTime(parseInt(e.target.value, 10)))}
                  aria-label="Time limit"
                  className={SLIDER_THUMB_CLASSES}
                  style={trackStyle(timePct)}
                />
                <div className="flex justify-between mt-1.5 text-[11px] text-slate-500">
                  <span>5 min</span>
                  <span>3 hrs</span>
                </div>
              </div>

              {/* Interview Mode */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">Interview Mode</p>
                <p className="text-[11px] text-slate-600 mb-3">Choose how you want to practice</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { value: "VOICE" as PracticeMode, label: "Voice", emoji: "🎙️", Icon: Mic },
                    { value: "TEXT"  as PracticeMode, label: "Text",  emoji: "💬", Icon: MessageSquare },
                    { value: "MIXED" as PracticeMode, label: "Mixed", emoji: "🔄", Icon: Shuffle },
                  ] as const).map(({ value, label, Icon }) => (
                    <button
                      key={value}
                      type="button"
                      role="radio"
                      aria-checked={selectedMode === value}
                      onClick={() => setSelectedMode(value)}
                      className={`flex flex-col items-center justify-center gap-1.5 rounded-xl py-3 px-2 text-xs font-semibold transition-all ${
                        selectedMode === value
                          ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20 ring-1 ring-purple-400/40"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </button>
                  ))}
                </div>
                {selectedMode === "MIXED" && (
                  <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                    Switch between 🎙️ Voice and 💬 Text for each question during the interview.
                  </p>
                )}
              </div>
            </div>

            {error && (
              <p className="mt-4 text-sm text-red-400 text-center">{error}</p>
            )}

            <button
              onClick={handleStart}
              disabled={starting}
              className="mt-7 w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {starting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Starting...
                </>
              ) : (
                <>
                  Start Practice <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  ) : null;
}
