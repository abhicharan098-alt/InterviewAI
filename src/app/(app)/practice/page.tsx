"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Activity,
  Target,
  Clock,
  MessageSquare,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Mic,
  FileText,
  Loader2,
  Crown,
  Lightbulb,
  Brain,
  Users,
  ShieldCheck,
  RefreshCw,
  Scale,
  GitBranch,
  HeartHandshake,
  Presentation,
  Code2
} from "lucide-react";
import Link from "next/link";

type Step = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

// Resume APIs return JSON, but a Vercel/Next error page (timeout, 5xx, …)
// comes back as HTML. Reading the body as text first keeps the wizard from
// crashing with "Unexpected token '<' ... is not valid JSON" and lets the
// catch handler fall back gracefully instead.
async function safeJson(res: Response): Promise<any> {
  const body = await res.text();
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

export default function PracticeWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [loading, setLoading] = useState(true);
  const [resumeData, setResumeData] = useState<any>(null);

  const [role, setRole] = useState("Frontend Developer");
  const [customRole, setCustomRole] = useState("");
  const [targetCompany, setTargetCompany] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("FRESHER");
  const [interviewType, setInterviewType] = useState("TECHNICAL");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [duration, setDuration] = useState(20);
  const [questionCount, setQuestionCount] = useState(10);
  const [mode, setMode] = useState("TEXT");

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/resume").then((res) => safeJson(res)),
      fetch("/api/profile").then((res) => safeJson(res)),
    ])
      .then(([resumeRes, profileRes]) => {
        const active = resumeRes.resumes?.find(
          (r: any) => r.status === "PARSED" && r.parsedData
        );
        if (active) setResumeData(active);
        
        if (profileRes && !profileRes.error) {
          if (profileRes.targetRole) {
            setRole("Other");
            setCustomRole(profileRes.targetRole);
          }
          if (profileRes.targetCompany) {
            setTargetCompany(profileRes.targetCompany);
          }
          if (profileRes.experienceLevel) {
            setExperienceLevel(profileRes.experienceLevel);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050814] flex items-center justify-center text-white">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="min-h-screen bg-[#050814] p-6 flex flex-col items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0D1424] p-8 text-center shadow-xl">
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-400/25">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">Upload Your Resume First</h2>
          <p className="mb-6 text-sm text-slate-400">
            InterviewAI uses your resume details to generate personalized, context-aware interview questions.
          </p>
          <Link
            href="/resume"
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition-all hover:brightness-110"
          >
            <FileText className="h-4 w-4" />
            Upload Resume
          </Link>
        </div>
      </div>
    );
  }

  const handleNext = () => {
    if (currentStep === 1 && role === "Other" && !customRole.trim()) {
      setError("Please specify a custom role.");
      return;
    }
    setError("");
    if (currentStep < 8) setCurrentStep((c) => (c + 1) as Step);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep((c) => (c - 1) as Step);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");

    try {
      const finalRole = role === "Other" ? customRole : role;

      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: finalRole,
          experienceLevel,
          interviewType,
          difficulty,
          durationMinutes: duration,
          questionCount,
          mode,
          targetCompany: targetCompany.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to generate interview");

      router.push(`/interview/${data.interviewId}`);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setGenerating(false);
    }
  };

  const steps = [
    { num: 1, title: "Job Role", icon: Briefcase },
    { num: 2, title: "Company", icon: Target },
    { num: 3, title: "Experience", icon: GraduationCap },
    { num: 4, title: "Type", icon: Activity },
    { num: 5, title: "Difficulty", icon: Target },
    { num: 6, title: "Duration", icon: Clock },
    { num: 7, title: "Mode", icon: MessageSquare },
    { num: 8, title: "Summary", icon: Sparkles },
  ];

  const roles = [
    "Frontend Developer",
    "Backend Developer",
    "Full Stack Developer",
    "Java Developer",
    "Python Developer",
    "Data Scientist",
    "Data Analyst",
    "Machine Learning Engineer",
    "DevOps Engineer",
    "Cloud Engineer",
    "Cybersecurity Engineer",
    "Mobile Developer",
    "UI/UX Designer",
    "Other",
  ];

  return (
    <div className="w-full">
      <div className="relative mx-auto w-full">
        {/* Header */}
        <header className="mb-8 text-center max-w-2xl mx-auto">
          <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-purple-300/90">
            InterviewAI · Practice Wizard
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Configure Your AI Interview
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            Customize your practice session built around your resume, skills, and target position.
          </p>
        </header>

        {/* Multi-step Stepper Indicator */}
        <div className="mb-8 hidden md:flex items-center justify-between rounded-2xl border border-white/[0.08] bg-[#0D1424] p-4 shadow-lg overflow-x-auto">
          {steps.map((s) => {
            const Icon = s.icon;
            const active = s.num === currentStep;
            const completed = s.num < currentStep;
            return (
              <div key={s.num} className="flex items-center gap-2.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-colors ${
                    active
                      ? "bg-purple-600 text-white shadow-md shadow-purple-950/40 ring-2 ring-purple-400/50"
                      : completed
                        ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-inset ring-emerald-400/30"
                        : "bg-white/[0.04] text-slate-500"
                  }`}
                >
                  {completed ? (
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  ) : (
                    <Icon className="h-4.5 w-4.5" />
                  )}
                </div>
                <span
                  className={`text-xs font-semibold whitespace-nowrap ${
                    active
                      ? "text-purple-300"
                      : completed
                        ? "text-slate-300"
                        : "text-slate-500"
                  }`}
                >
                  {s.title}
                </span>
                {s.num < 8 && (
                  <ChevronRight className="h-4 w-4 text-slate-700 mx-1 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Container Card */}
        <div className="relative min-h-[440px] rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 sm:p-8 md:p-10 shadow-2xl flex flex-col justify-between overflow-hidden">
          {/* Generating loader overlay */}
          {generating && (
            <div className="fixed top-0 left-0 z-[9999] flex h-[100dvh] w-[100vw] flex-col items-center justify-center bg-[#050814]/90 backdrop-blur-md p-6 text-center">
              <Sparkles className="mb-4 h-14 w-14 animate-pulse text-purple-400" />
              <h2 className="mb-2 text-2xl font-bold text-white">
                Building Your Interview…
              </h2>
              <p className="max-w-md text-sm text-slate-400">
                Generating personalized questions tailored to your resume, experience level, and target role.
              </p>
            </div>
          )}

          <div className="flex-grow">
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-medium text-red-300">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            {/* STEP 1: Job Role */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="mb-2 text-xl font-bold text-white">Select Your Target Role</h2>
                <p className="mb-6 text-sm text-slate-400">
                  Choose the job position you want to practice for.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {roles.map((r) => {
                    const isSelected = role === r;
                    return (
                      <button
                        key={r}
                        onClick={() => setRole(r)}
                        className={`rounded-xl border p-4 text-left font-medium transition-all ${
                          isSelected
                            ? "border-purple-500 bg-purple-500/10 text-white ring-1 ring-purple-400/40"
                            : "border-white/[0.08] bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]"
                        }`}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
                {role === "Other" && (
                  <input
                    type="text"
                    placeholder="Enter your custom job title..."
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    className="mt-4 w-full rounded-xl border border-white/[0.1] bg-white/[0.04] p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                )}
              </div>
            )}

            {/* STEP 2: Target Company */}
            {currentStep === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="mb-2 text-xl font-bold text-white">Target Company (Optional)</h2>
                <p className="mb-6 text-sm text-slate-400">
                  Knowing the company helps tailor the situational context of the questions.
                </p>
                <input
                  type="text"
                  placeholder="e.g., Google, Stripe, or leave blank..."
                  value={targetCompany}
                  onChange={(e) => setTargetCompany(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.1] bg-white/[0.04] p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                
                <div className="mt-6 flex flex-wrap gap-2">
                  {["Google", "Meta", "Amazon", "Apple", "Netflix", "Stripe"].map(company => (
                    <button
                      key={company}
                      onClick={() => setTargetCompany(company)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        targetCompany === company 
                          ? "border-purple-500 bg-purple-500/20 text-purple-300" 
                          : "border-white/10 bg-white/5 text-slate-400 hover:bg-white/10"
                      }`}
                    >
                      {company}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 3: Experience */}
            {currentStep === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="mb-2 text-xl font-bold text-white">Select Experience Level</h2>
                <p className="mb-6 text-sm text-slate-400">
                  We adapt question complexity based on your experience.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { val: "FRESHER", label: "Fresher / Entry Level" },
                    { val: "ZERO_TO_ONE", label: "0–1 Years" },
                    { val: "ONE_TO_TWO", label: "1–2 Years" },
                    { val: "TWO_TO_FIVE", label: "2–5 Years" },
                    { val: "FIVE_PLUS", label: "5+ Years" },
                  ].map((lvl) => {
                    const isSelected = experienceLevel === lvl.val;
                    return (
                      <button
                        key={lvl.val}
                        onClick={() => setExperienceLevel(lvl.val)}
                        className={`rounded-xl border p-5 text-left transition-all ${
                          isSelected
                            ? "border-purple-500 bg-purple-500/10 text-white ring-1 ring-purple-400/40"
                            : "border-white/[0.08] bg-white/[0.03] text-slate-300 hover:border-white/20 hover:bg-white/[0.06]"
                        }`}
                      >
                        <span className="text-base font-semibold">{lvl.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: Interview Type */}
            {currentStep === 4 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="mb-2 text-xl font-bold text-white">Select Interview Type</h2>
                <p className="mb-6 text-sm text-slate-400">
                  Choose the category of questions you want to practice.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { val: "TECHNICAL", title: "Technical", desc: "Role-specific concepts, system knowledge, and domain questions." },
                    { val: "HR", title: "HR", desc: "Common recruiter questions, company fit, and career goals." },
                    { val: "BEHAVIORAL", title: "Behavioral", desc: "Situational questions using the STAR framework." },
                    { val: "MIXED", title: "Mixed", desc: "Balanced combination of technical, HR, and behavioral questions." },
                    { val: "CODING", title: "Coding", desc: "Algorithmic thinking, problem-solving, and code logic." },
                  ].map((t) => {
                    const isSelected = interviewType === t.val;
                    return (
                      <button
                        key={t.val}
                        onClick={() => setInterviewType(t.val)}
                        className={`rounded-xl border p-5 text-left transition-all flex flex-col gap-1.5 ${
                          isSelected
                            ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-400/40"
                            : "border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                        }`}
                      >
                        <span className={`text-base font-semibold ${isSelected ? "text-purple-300" : "text-white"}`}>
                          {t.title}
                        </span>
                        <span className="text-xs text-slate-400 leading-relaxed">{t.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 5: Difficulty */}
            {currentStep === 5 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="mb-2 text-xl font-bold text-white">Select Difficulty Level</h2>
                <p className="mb-6 text-sm text-slate-400">
                  Select how challenging you want the interview questions to be.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { val: "EASY", title: "Easy", desc: "Foundational questions and direct concepts." },
                    { val: "MEDIUM", title: "Medium", desc: "Standard industry interviewer standards." },
                    { val: "HARD", title: "Hard", desc: "Deep technical questions and scenario analysis." },
                    { val: "EXPERT", title: "Expert", desc: "Senior/Staff level architecture and design challenges." },
                  ].map((d) => {
                    const isSelected = difficulty === d.val;
                    return (
                      <button
                        key={d.val}
                        onClick={() => setDifficulty(d.val)}
                        className={`rounded-xl border p-5 text-left transition-all flex flex-col gap-1.5 ${
                          isSelected
                            ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-400/40"
                            : "border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                        }`}
                      >
                        <span className={`text-base font-semibold ${isSelected ? "text-purple-300" : "text-white"}`}>
                          {d.title}
                        </span>
                        <span className="text-xs text-slate-400 leading-relaxed">{d.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 6: Duration & Question Count */}
            {currentStep === 6 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-8">
                <div>
                  <h2 className="mb-2 text-xl font-bold text-white">Select Interview Duration</h2>
                  <p className="mb-8 text-sm text-slate-400">
                    Control how long your interview lasts.
                  </p>
                  
                  <div className="mb-12">
                    <div className="mb-4 flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                        Interview Duration
                      </label>
                      <span className="rounded-lg bg-purple-500/20 px-3 py-1 text-lg font-bold text-purple-300">
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
                </div>

                <div>
                  <h2 className="mb-2 text-xl font-bold text-white">Select Number of Questions</h2>
                  <p className="mb-8 text-sm text-slate-400">
                    Choose how many questions you want to answer.
                  </p>
                  
                  <div className="mb-8">
                    <div className="mb-4 flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                        Total Questions
                      </label>
                      <span className="rounded-lg bg-purple-500/20 px-3 py-1 text-lg font-bold text-purple-300">
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
                </div>
              </div>
            )}

            {/* STEP 7: Mode */}
            {currentStep === 7 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <h2 className="mb-2 text-xl font-bold text-white">Select Response Mode</h2>
                <p className="mb-6 text-sm text-slate-400">
                  Choose how you want to answer questions during the interview.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { val: "TEXT", title: "⌨ Text Mode", desc: "Type your responses into a text editor with time limits." },
                    { val: "VOICE", title: "🎙 Voice Mode", desc: "Speak your answers aloud using real-time speech recognition." },
                    { val: "MIXED", title: "🎙 + ⌨ Mixed Mode", desc: "Use both voice speech-to-text and typing seamlessly." },
                  ].map((m) => {
                    const isSelected = mode === m.val;
                    return (
                      <button
                        key={m.val}
                        onClick={() => setMode(m.val)}
                        className={`rounded-xl border p-6 text-left transition-all flex flex-col gap-2 ${
                          isSelected
                            ? "border-purple-500 bg-purple-500/10 ring-1 ring-purple-400/40"
                            : "border-white/[0.08] bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                        }`}
                      >
                        <span className={`text-base font-semibold ${isSelected ? "text-purple-300" : "text-white"}`}>
                          {m.title}
                        </span>
                        <span className="text-xs text-slate-400 leading-relaxed">{m.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 8: Summary */}
            {currentStep === 8 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                <div>
                  <h2 className="mb-2 text-xl font-bold text-white">Review & Generate</h2>
                  <p className="text-sm text-slate-400">
                    Confirm your configuration before starting your AI practice session.
                  </p>
                </div>

                {/* Configuration Summary Card */}
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-6 text-sm mb-6">
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">Role</span>
                      <span className="font-semibold text-white">{role === "Other" ? customRole : role}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">Company</span>
                      <span className="font-semibold text-white">{targetCompany || "Not specified"}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">Experience</span>
                      <span className="font-semibold text-white">{experienceLevel}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">Type</span>
                      <span className="font-semibold text-white">{interviewType}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">Difficulty</span>
                      <span className="font-semibold text-white">{difficulty}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">Duration</span>
                      <span className="font-semibold text-white">{duration} mins ({questionCount} Qs)</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-xs uppercase tracking-wider">Mode</span>
                      <span className="font-semibold text-purple-300">{mode}</span>
                    </div>
                  </div>
                </div>

                {/* Active Resume Context Card */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-purple-500/20 bg-purple-900/[0.08] p-5">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-purple-500/10 text-purple-300">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-purple-300">
                        Resume Context Active
                      </p>
                      <p className="text-sm font-semibold text-white">
                        {resumeData.parsedData.name || "Candidate"} · {resumeData.fileName}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/resume"
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-white/[0.06] px-3.5 text-xs font-semibold text-slate-200 ring-1 ring-inset ring-white/[0.1] hover:bg-white/[0.1]"
                  >
                    Change Resume
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="mt-8 flex items-center justify-between border-t border-white/[0.08] pt-6">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || generating}
              className={`inline-flex h-11 items-center gap-2 rounded-xl bg-white/[0.06] px-5 text-sm font-semibold text-white ring-1 ring-inset ring-white/[0.1] transition-all hover:bg-white/[0.1] disabled:opacity-0`}
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>

            {currentStep < 8 ? (
              <button
                onClick={handleNext}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition-all hover:brightness-110"
              >
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-7 text-sm font-semibold text-white shadow-lg shadow-purple-950/40 transition-all hover:brightness-110 disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                Generate Interview
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
