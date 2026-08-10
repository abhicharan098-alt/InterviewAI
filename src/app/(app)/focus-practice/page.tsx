"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Target } from "lucide-react";
import { Reveal } from "@/components/dashboard/Reveal";

export default function FocusPracticeSetupPage() {
  const router = useRouter();
  const [duration, setDuration] = useState(20);
  const [questionCount, setQuestionCount] = useState(10);
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/profile")
      .then(res => res.json())
      .then(data => {
        if (data.focusAreas) {
          setFocusAreas(data.focusAreas);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleStart = async () => {
    setError("");
    setStarting(true);
    try {
      const res = await fetch("/api/interviews/focus-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "MIXED", durationMinutes: duration, questionCount }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to start focus practice.");
      }
      
      if (data.interviewId) {
        router.replace(`/focus-practice/${data.interviewId}`);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050814] flex items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center p-6 bg-[#050814]">
      <Reveal className="w-full max-w-xl">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0D1424] p-8 shadow-2xl relative overflow-hidden">
          {starting && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#050814]/90 backdrop-blur-md p-6 text-center">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-purple-400" />
              <h2 className="mb-2 text-xl font-bold text-white">
                Preparing Focus Practice...
              </h2>
            </div>
          )}
          
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-purple-500/10 text-purple-400 ring-1 ring-inset ring-purple-500/20">
              <Target className="h-7 w-7" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-white">Configure Focus Practice</h1>
            <p className="text-sm text-slate-400">
              Choose how long you want to practice and how many questions you want to answer.
            </p>
          </div>

          {focusAreas.length > 0 && (
            <div className="mb-8">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-3 text-center">
                Selected Focus Areas
              </label>
              <div className="flex flex-wrap justify-center gap-2">
                {focusAreas.map(area => (
                  <span key={area} className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          <div className="space-y-8">
            {/* Duration Slider */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                  Session Duration
                </label>
                <span className="rounded-lg bg-purple-500/20 px-3 py-1 text-base font-bold text-purple-300">
                  {duration} minutes
                </span>
              </div>
              
              <div className="relative flex items-center gap-4">
                <button 
                  onClick={() => setDuration(Math.max(5, duration - 5))}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10"
                >
                  -
                </button>
                <div className="relative flex-1">
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/[0.08] accent-purple-500 outline-none"
                    style={{
                      background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${((duration - 5) / 55) * 100}%, rgba(255, 255, 255, 0.08) ${((duration - 5) / 55) * 100}%, rgba(255, 255, 255, 0.08) 100%)`
                    }}
                  />
                </div>
                <button 
                  onClick={() => setDuration(Math.min(60, duration + 5))}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10"
                >
                  +
                </button>
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>5 min</span>
                <span>60 min</span>
              </div>
            </div>

            {/* Questions Slider */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                  Number of Questions
                </label>
                <span className="rounded-lg bg-purple-500/20 px-3 py-1 text-base font-bold text-purple-300">
                  {questionCount} questions
                </span>
              </div>
              
              <div className="relative flex items-center gap-4">
                <button 
                  onClick={() => setQuestionCount(Math.max(5, questionCount - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10"
                >
                  -
                </button>
                <div className="relative flex-1">
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/[0.08] accent-purple-500 outline-none"
                    style={{
                      background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${((questionCount - 5) / 25) * 100}%, rgba(255, 255, 255, 0.08) ${((questionCount - 5) / 25) * 100}%, rgba(255, 255, 255, 0.08) 100%)`
                    }}
                  />
                </div>
                <button 
                  onClick={() => setQuestionCount(Math.min(30, questionCount + 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white hover:bg-white/10"
                >
                  +
                </button>
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>5</span>
                <span>30</span>
              </div>
            </div>

            <div className="rounded-xl bg-[#0a0f1c] border border-white/[0.05] p-4 text-center">
              <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">Estimated session pace</div>
              <div className="text-sm font-medium text-purple-300">
                ~{Math.round((duration / questionCount) * 10) / 10} minutes per question
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-white/[0.08]">
              <button
                onClick={() => router.push("/focus-areas")}
                className="w-1/3 rounded-xl border border-white/[0.1] bg-white/[0.02] py-3.5 text-sm font-semibold text-white transition-all hover:bg-white/[0.06]"
              >
                ← Back
              </button>
              <button
                onClick={handleStart}
                className="w-2/3 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition-all hover:brightness-110"
              >
                Start Focus Practice →
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
