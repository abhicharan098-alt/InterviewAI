"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Crown,
  Lightbulb,
  Brain,
  Users,
  ShieldCheck,
  Clock,
  RefreshCw,
  Scale,
  GitBranch,
  Sparkles,
  HeartHandshake,
  Presentation,
  Code2,
  AlertCircle,
  Loader2,
  Save,
  CheckCircle2,
} from "lucide-react";
import { Reveal } from "@/components/dashboard/Reveal";

const FOCUS_AREAS_OPTIONS = [
  { id: "Communication Skills", icon: MessageSquare, desc: "Speak clearly and structure your answers effectively." },
  { id: "Leadership", icon: Crown, desc: "Practice ownership, delegation and decision-making." },
  { id: "Problem Solving", icon: Lightbulb, desc: "Improve your approach to technical and real-world problems." },
  { id: "Critical Thinking", icon: Brain, desc: "Strengthen reasoning, analysis and evaluation." },
  { id: "Teamwork", icon: Users, desc: "Practice collaboration and team-based situations." },
  { id: "Confidence", icon: ShieldCheck, desc: "Improve confidence and clarity while answering." },
  { id: "Time Management", icon: Clock, desc: "Practice giving concise answers under time pressure." },
  { id: "Adaptability", icon: RefreshCw, desc: "Handle unexpected questions and changing situations." },
  { id: "Conflict Resolution", icon: Scale, desc: "Practice handling disagreements professionally." },
  { id: "Decision Making", icon: GitBranch, desc: "Improve judgment and decision-making under pressure." },
  { id: "Creativity & Innovation", icon: Sparkles, desc: "Demonstrate creative approaches and new ideas." },
  { id: "Emotional Intelligence", icon: HeartHandshake, desc: "Improve self-awareness and interpersonal communication." },
  { id: "Presentation Skills", icon: Presentation, desc: "Improve explanation, structure and delivery." },
  { id: "Technical Skills", icon: Code2, desc: "Focus more deeply on role-specific technical knowledge." },
];

export default function FocusAreasPage() {
  const [focusAreas, setFocusAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalAreas, setOriginalAreas] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/focus-areas")
      .then((res) => res.json())
      .then((data) => {
        if (data.focusAreas) {
          setFocusAreas(data.focusAreas);
          setOriginalAreas(data.focusAreas);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load focus areas.");
        setLoading(false);
      });
  }, []);

  const toggleFocusArea = (id: string) => {
    setSuccess(false);
    setError("");
    let newAreas = [...focusAreas];
    if (newAreas.includes(id)) {
      newAreas = newAreas.filter((f) => f !== id);
    } else {
      newAreas.push(id);
    }
    setFocusAreas(newAreas);
    
    // Check if changed from original
    const isDifferent = 
      newAreas.length !== originalAreas.length || 
      !newAreas.every(a => originalAreas.includes(a));
      
    setHasChanges(isDifferent);
  };

  const handleSave = async () => {
    if (!hasChanges) return;
    
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/focus-areas", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ focusAreas }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save focus areas");
      }

      setOriginalAreas(focusAreas);
      setHasChanges(false);
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="w-full pb-20">
      <Reveal>
        <header className="mb-8">
          <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-purple-300/90">
            InterviewAI
          </p>
          <h1 className="text-[28px] font-bold leading-tight tracking-tight text-white sm:text-4xl">
            Focus Areas
          </h1>
          <p className="mt-2 text-[15px] text-slate-400">
            Choose the skills you want InterviewAI to help you improve.
          </p>
        </header>
      </Reveal>

      {error && (
        <Reveal delay={100}>
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        </Reveal>
      )}

      {success && (
        <Reveal delay={100}>
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-medium text-emerald-300">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            Focus areas updated successfully.
          </div>
        </Reveal>
      )}

      <Reveal delay={200}>
        <div className="rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 sm:p-8 md:p-10 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white">Select the skills you want to improve</h2>
            <span className="text-sm font-medium px-3 py-1 rounded-full bg-white/5 text-slate-300">
              {focusAreas.length} selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {FOCUS_AREAS_OPTIONS.map((area) => {
              const isSelected = focusAreas.includes(area.id);
              const Icon = area.icon;
              return (
                <button
                  key={area.id}
                  onClick={() => toggleFocusArea(area.id)}
                  className={`group relative rounded-xl border p-4 text-left transition-all flex flex-col gap-2 min-w-0 ${
                    isSelected
                      ? "border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-400/40"
                      : "border-white/[0.08] bg-[#0D1424] hover:border-white/20 hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 w-full pr-6">
                    <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors ${
                      isSelected 
                        ? "bg-purple-500/20 text-purple-400" 
                        : "bg-white/[0.05] text-slate-400 group-hover:text-slate-300"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <span className={`text-[15px] font-semibold truncate transition-colors ${
                      isSelected 
                        ? "text-purple-300" 
                        : "text-white"
                    }`}>
                      {area.id}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 leading-relaxed overflow-wrap-anywhere break-words">
                    {area.desc}
                  </span>
                  
                  {isSelected && (
                    <div className="absolute top-4 right-4 text-purple-400">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row justify-end items-center gap-4 border-t border-white/[0.08] pt-6">
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-7 text-sm font-semibold transition-all ${
                hasChanges 
                  ? "bg-white/[0.06] text-slate-200 hover:bg-white/[0.1]" 
                  : "bg-white/[0.03] text-slate-500 cursor-not-allowed"
              }`}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Focus Areas
            </button>
            <Link
              href="/focus-practice"
              className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-7 text-sm font-semibold transition-all w-full sm:w-auto ${
                focusAreas.length > 0
                  ? "bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-950/40 hover:brightness-110"
                  : "bg-white/[0.06] text-slate-500 cursor-not-allowed pointer-events-none"
              }`}
            >
              Practice My Focus Areas →
            </Link>
          </div>
          {focusAreas.length === 0 && (
            <p className="mt-4 text-center text-sm text-amber-400/80">Select at least one focus area to start practicing.</p>
          )}
        </div>
      </Reveal>
    </div>
  );
}
