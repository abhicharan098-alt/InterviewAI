"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BrainCircuit,
  Clock,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PlayCircle,
  FastForward,
  ChevronRight,
  AlertTriangle,
  ArrowLeft,
  Layout,
  Target,
  Sparkles,
  X,
  AlertCircle,
  Activity,
  CheckCircle2,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { InterviewPauseModal } from "@/components/interviews/InterviewPauseModal";

/* ─── Web Speech API types ─── */
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((ev: ISpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
}

interface ISpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: { readonly transcript: string };
}

interface ISpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: { length: number; [index: number]: ISpeechRecognitionResult };
}

declare global {
  interface Window {
    SpeechRecognition: { new (): ISpeechRecognition };
    webkitSpeechRecognition: { new (): ISpeechRecognition };
  }
}

type InterviewMode = "TEXT" | "VOICE" | "MIXED";

/* ─── Inline Error Toast Component ─── */
function ErrorToast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed top-20 right-6 z-50 flex items-center gap-3 rounded-xl border border-red-500/30 bg-[#0D1424] px-4 py-3 text-sm font-medium text-red-300 shadow-2xl animate-in fade-in slide-in-from-top-2">
      <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
      <span className="max-w-md break-words">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 rounded p-0.5 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Dismiss error"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* VoicePanel — microphone + speech-to-text panel              */
/* ─────────────────────────────────────────────────────────── */
function VoicePanel({
  answerText,
  setAnswerText,
  isSubmitting,
  showTextFallback,
}: {
  answerText: string;
  setAnswerText: (v: string) => void;
  isSubmitting: boolean;
  showTextFallback: boolean;
}) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [interim, setInterim] = useState("");
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const answerRef = useRef(answerText);
  useEffect(() => {
    answerRef.current = answerText;
  }, [answerText]);

  useEffect(() => {
    const SpeechRecognitionCtor: { new (): ISpeechRecognition } | undefined =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setSupported(false);
      return;
    }

    const rec = new SpeechRecognitionCtor();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-US";

    rec.onresult = (e: ISpeechRecognitionEvent) => {
      let finalText = "";
      let interimText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalText += e.results[i][0].transcript;
        } else {
          interimText += e.results[i][0].transcript;
        }
      }
      if (finalText) {
        setAnswerText((answerRef.current + " " + finalText).trimStart());
      }
      setInterim(interimText);
    };

    rec.onend = () => {
      setListening(false);
      setInterim("");
    };

    rec.onerror = () => {
      setListening(false);
      setInterim("");
    };

    recognitionRef.current = rec;
    return () => rec.stop();
  }, [setAnswerText]);

  const toggleListening = () => {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (listening) {
      rec.stop();
      setListening(false);
    } else {
      rec.start();
      setListening(true);
    }
  };

  if (!supported) {
    return (
      <div className="flex flex-grow flex-col items-center justify-center gap-4 p-6 text-center">
        <MicOff className="h-10 w-10 text-slate-500" />
        <p className="text-sm text-slate-400">
          Voice input is not supported in this browser.
          <br />
          Please use Chrome or Edge, or switch to Text mode.
        </p>
        {showTextFallback && (
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Type your answer here instead..."
            disabled={isSubmitting}
            className="mt-2 w-full min-h-[140px] rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-base leading-relaxed"
          />
        )}
      </div>
    );
  }

  const stateBadge = listening
    ? { label: "Listening", cls: "bg-red-500/15 text-red-400 ring-red-400/30" }
    : answerText
    ? { label: "Transcript Ready", cls: "bg-emerald-500/15 text-emerald-400 ring-emerald-400/30" }
    : { label: "Ready to Record", cls: "bg-purple-500/15 text-purple-300 ring-purple-400/30" };

  return (
    <div className="flex flex-grow flex-col gap-4 p-6">
      <div className="flex flex-col items-center gap-6 py-6">
        <button
          onClick={toggleListening}
          disabled={isSubmitting}
          aria-label={listening ? "Stop recording voice" : "Start recording voice"}
          className={`relative flex h-24 w-24 items-center justify-center rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 ${
            listening
              ? "bg-red-500 shadow-[0_0_0_16px_rgba(239,68,68,0.15)] hover:bg-red-600"
              : "bg-gradient-to-br from-purple-600 to-violet-600 shadow-lg shadow-purple-950/40 hover:brightness-110"
          }`}
        >
          {listening ? (
            <MicOff className="h-10 w-10 text-white" />
          ) : (
            <Mic className="h-10 w-10 text-white" />
          )}
        </button>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold ring-1 ring-inset ${stateBadge.cls}`}>
          {listening && <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />}
          {listening ? "Recording..." : stateBadge.label}
        </span>
      </div>

      <div className="flex-grow rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 shadow-inner">
        <p className="min-h-[100px] break-words text-[15px] leading-relaxed text-white">
          {answerText || <span className="text-slate-600 italic">Your spoken answer will appear here…</span>}
          {interim && <span className="text-slate-400"> {interim}</span>}
        </p>
      </div>

      {answerText && (
        <div className="mt-2">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
            Edit Transcript
          </label>
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            disabled={isSubmitting}
            className="w-full min-h-[100px] rounded-xl border border-white/[0.08] bg-white/[0.04] p-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none text-sm leading-relaxed"
          />
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/* Main interview page                                         */
/* ─────────────────────────────────────────────────────────── */
export default function InterviewEnginePage() {
  const { id } = useParams();
  const router = useRouter();

  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [status, setStatus] = useState<string>("DRAFT");
  const [currentIndex, setCurrentIndex] = useState(0);

  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);

  const [answerText, setAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  /* TTS state */
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(
    (text: string) => {
      if (!ttsEnabled || typeof window === "undefined" || !window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.rate = 0.95;
      utt.pitch = 1;
      utt.lang = "en-US";
      utt.onstart = () => setSpeaking(true);
      utt.onend = () => setSpeaking(false);
      utt.onerror = () => setSpeaking(false);
      window.speechSynthesis.speak(utt);
    },
    [ttsEnabled]
  );

  const fetchInterview = async () => {
    try {
      const res = await fetch(`/api/interviews/${id}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const intv = data.interview;
      setInterview(intv);
      setStatus(intv.status);

      if (intv.status === "COMPLETED") {
        router.push(`/interview/${id}/result`);
        return;
      }

      if (intv.status === "IN_PROGRESS" || intv.status === "PAUSED") {
        const nextUnanswered = intv.questions.findIndex((q: any) => !q.answer);
        if (nextUnanswered !== -1) {
          setCurrentIndex(nextUnanswered);
          setQuestionStartTime(Date.now());
        } else {
          handleComplete();
        }

        if (intv.status === "PAUSED") {
          setTimeRemaining(intv.remainingSeconds ?? (intv.durationMinutes * 60));
          setShowReminderModal(true);
        } else if (intv.resumedAt || intv.startedAt) {
          const startTime = new Date(intv.resumedAt || intv.startedAt).getTime();
          const rem = intv.remainingSeconds ?? (intv.durationMinutes * 60);
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setTimeRemaining(Math.max(0, rem - elapsed));
        }
      }

      setLoading(false);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterview();
  }, [id]);

  const interviewMode: InterviewMode = interview?.mode ?? "TEXT";

  useEffect(() => {
    if (
      status === "IN_PROGRESS" &&
      interview &&
      (interviewMode === "VOICE" || interviewMode === "MIXED")
    ) {
      const q = interview.questions[currentIndex];
      if (q) speak(q.question);
    }
  }, [currentIndex, status, interviewMode, interview, speak]);

  useEffect(() => {
    if (!ttsEnabled && typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [ttsEnabled]);

  useEffect(() => {
    if (status !== "IN_PROGRESS" || timeRemaining === null) return;
    if (timeRemaining <= 0) {
      handleComplete();
      return;
    }
    const interval = setInterval(() => {
      setTimeRemaining((t) => (t !== null && t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeRemaining, status]);

  const handleStart = async () => {
    setIsSubmitting(true);
    setActionError("");
    try {
      const res = await fetch(`/api/interviews/${id}/start`, { method: "POST" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setStatus("IN_PROGRESS");
      setCurrentIndex(0);
      setQuestionStartTime(Date.now());
      setTimeRemaining(interview.durationMinutes * 60);
      setInterview((prev: any) => ({ ...prev, startedAt: data.startedAt, status: "IN_PROGRESS" }));
    } catch (err: any) {
      setActionError(err.message || "Failed to start interview.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isThinking, setIsThinking] = useState(false);
  const [thinkingText, setThinkingText] = useState("");
  // For MIXED mode: which input method is currently active (per question, resets on submit)
  const [mixedInputMode, setMixedInputMode] = useState<"voice" | "text">("voice");

  const submitAnswer = async (skipped: boolean = false) => {
    if (isSubmitting) return;
    if (!skipped && !answerText.trim()) return;

    if (typeof window !== "undefined") window.speechSynthesis?.cancel();

    setIsSubmitting(true);
    setActionError("");
    const durationSec = Math.floor((Date.now() - questionStartTime) / 1000);
    const question = interview.questions[currentIndex];
    const userEnteredText = answerText.trim();

    try {
      // 1. Submit current answer
      const res = await fetch(`/api/interviews/${id}/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          answerText: skipped ? "" : userEnteredText,
          durationSec,
          skipped,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAnswerText("");
      // Reset mixed input mode to voice for next question
      setMixedInputMode("voice");

      let adaptiveFollowUp: any = null;

      // 2. Call Adaptive AI decision if not skipped
      if (!skipped && userEnteredText.length > 0) {
        setIsThinking(true);
        setThinkingText("Preparing next question...");

        try {
          const adaptiveRes = await fetch(`/api/interviews/${id}/adaptive`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              questionId: question.id,
              answer: userEnteredText,
            }),
          });
          const adaptiveData = await adaptiveRes.json();
          if (adaptiveData.action === "FOLLOW_UP" && adaptiveData.question) {
            adaptiveFollowUp = adaptiveData.question;
          }
        } catch (adaptiveErr) {
          console.error("Adaptive API Error (continuing smoothly):", adaptiveErr);
        } finally {
          setIsThinking(false);
          setThinkingText("");
        }
      }

      // 3. Handle follow-up or next topic
      const nextIndex = currentIndex + 1;
      const questionLimit = interview.questionCount || interview.questions.length;
      
      if (nextIndex >= questionLimit) {
        await handleComplete();
        return;
      }

      if (adaptiveFollowUp) {
        setInterview((prev: any) => {
          const updatedQuestions = [...prev.questions];
          updatedQuestions.splice(currentIndex + 1, 0, adaptiveFollowUp);
          return { ...prev, questions: updatedQuestions };
        });
        setCurrentIndex((c) => c + 1);
        setQuestionStartTime(Date.now());
      } else {
        if (currentIndex + 1 < interview.questions.length) {
          setCurrentIndex((c) => c + 1);
          setQuestionStartTime(Date.now());
        } else {
          await handleComplete();
        }
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to submit answer.");
    } finally {
      setIsSubmitting(false);
      setIsThinking(false);
    }
  };

  const handleComplete = async () => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    try {
      await fetch(`/api/interviews/${id}/complete`, { method: "POST" });
      router.push(`/interview/${id}/result`);
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    const mm = m.toString().padStart(2, "0");
    const ss = s.toString().padStart(2, "0");
    return h > 0 ? `${h}:${mm}:${ss}` : `${m}:${ss}`;
  };

  /* Loading state */
  if (loading) {
    return (
      <div className="flex h-[calc(100vh-64px)] w-full flex-col items-center justify-center text-white">
        <BrainCircuit className="w-12 h-12 text-purple-500 animate-pulse mb-4" />
        <p className="text-sm font-medium text-slate-400">Loading session...</p>
      </div>
    );
  }

  /* Error state */
  if (error || !interview) {
    return (
      <div className="flex h-[calc(100vh-64px)] w-full flex-col items-center justify-center p-6 text-white">
        <div className="max-w-md w-full bg-[#0D1424] border border-white/[0.08] rounded-2xl p-8 text-center shadow-xl">
          <AlertTriangle className="h-14 w-14 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-red-300 text-sm mb-6">{error || "Interview not found"}</p>
          <Link
            href="/practice"
            className="block w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold py-3 rounded-xl transition-all hover:brightness-110 text-sm"
          >
            Back to Practice
          </Link>
        </div>
      </div>
    );
  }

  /* DRAFT / Ready Screen */
  if (status === "DRAFT" || status === "READY") {
    return (
      <div className="flex flex-col text-white">
        {actionError && <ErrorToast message={actionError} onClose={() => setActionError("")} />}

        <div className="max-w-4xl w-full mx-auto mt-10">
          <div className="bg-[#0D1424] border border-white/[0.08] rounded-2xl shadow-xl overflow-hidden relative">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-purple-600/15 blur-[80px]" />
            <div className="relative p-8 border-b border-white/[0.08] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-purple-400 mb-2">Workspace Ready</p>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {interview.role}
                </h1>
                <p className="text-sm text-slate-400">
                  Your personalized environment is ready. Click start when you are prepared.
                </p>
              </div>
              <button
                onClick={handleStart}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-purple-600 to-violet-600 disabled:opacity-50 text-white font-semibold py-3.5 px-8 rounded-xl flex items-center gap-2 transition-all hover:brightness-110 shadow-lg shadow-purple-900/30 text-sm shrink-0"
              >
                <PlayCircle className="w-5 h-5" />{" "}
                {isSubmitting ? "Starting..." : "Start Interview"}
              </button>
            </div>

            <div className="relative grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-white/[0.08] bg-white/[0.01]">
              <div className="p-6">
                <span className="text-slate-500 block text-xs font-semibold uppercase tracking-wider mb-1">Mode</span>
                <span className="text-white font-semibold">{interviewMode}</span>
              </div>
              <div className="p-6">
                <span className="text-slate-500 block text-xs font-semibold uppercase tracking-wider mb-1">Type</span>
                <span className="text-white font-semibold">{interview.interviewType}</span>
              </div>
              <div className="p-6">
                <span className="text-slate-500 block text-xs font-semibold uppercase tracking-wider mb-1">Difficulty</span>
                <span className="text-white font-semibold">{interview.difficulty}</span>
              </div>
              <div className="p-6">
                <span className="text-slate-500 block text-xs font-semibold uppercase tracking-wider mb-1">Duration</span>
                <span className="text-white font-semibold">{interview.durationMinutes}m ({interview.questionCount} Qs)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* IN_PROGRESS Screen */
  const currentQuestion = interview.questions[currentIndex];
  const questionLimit = interview.questionCount || interview.questions.length;
  const progressPercent = ((currentIndex + 1) / questionLimit) * 100;
  const isVoice = interviewMode === "VOICE";
  const isMixed = interviewMode === "MIXED";
  const ttsSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  return (
    <div className="flex h-[calc(100vh-100px)] flex-col text-white">
      {actionError && <ErrorToast message={actionError} onClose={() => setActionError("")} />}

      {/* Top Action Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={async () => {
            try {
              await fetch(`/api/interviews/${id}/pause`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ remainingSeconds: timeRemaining, currentQuestionIndex: currentIndex }),
              });
              setStatus("PAUSED");
            } catch (e) {
              console.error("Failed to pause", e);
            }
            setShowReminderModal(true);
          }}
          className="inline-flex items-center text-sm font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Pause / Exit Interview
        </button>
      </div>

      {/* Reminder Modal */}
      {showReminderModal && (
        <InterviewPauseModal
          interviewId={id as string}
          interviewType={interview.interviewType}
          onClose={() => setShowReminderModal(false)}
          onResume={async () => {
            try {
              await fetch(`/api/interviews/${id}/resume`, { method: "POST" });
              setStatus("IN_PROGRESS");
            } catch (e) {
              console.error(e);
            }
            setShowReminderModal(false);
          }}
        />
      )}

      {/* Modal End Interview Confirmation */}
      {showEndDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050814]/80 backdrop-blur-sm p-4">
          <div data-chaos-item="true" className="w-full max-w-sm rounded-2xl border border-white/[0.1] bg-[#0D1424] p-6 shadow-2xl text-center">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">End Interview?</h2>
            <p className="text-sm text-slate-400 mb-6">
              Your answered questions will be evaluated, but remaining questions will be skipped.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={async () => {
                  setShowEndDialog(false);
                  try {
                    await fetch(`/api/interviews/${id}/pause`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ remainingSeconds: timeRemaining, currentQuestionIndex: currentIndex }),
                    });
                    setStatus("PAUSED");
                  } catch (e) {
                    console.error("Failed to pause", e);
                  }
                  setShowReminderModal(true);
                }}
                className="w-full bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-300 font-semibold py-3 rounded-xl transition-colors text-sm"
              >
                🔔 Remind Me Later
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndDialog(false)}
                  className="flex-1 bg-white/[0.05] hover:bg-white/[0.1] text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowEndDialog(false);
                    handleComplete();
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  End Interview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Grid (3 columns) */}
      <main className="grid flex-grow grid-cols-1 gap-6 lg:grid-cols-12 min-h-0">
        
        {/* Left Panel: Question Context */}
        <div className="flex flex-col lg:col-span-4 min-h-0">
          <div data-chaos-item="true" className="flex-grow rounded-2xl border border-white/[0.08] bg-[#0D1424] shadow-lg flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 to-transparent pointer-events-none" />
            
            <div className="p-6 border-b border-white/[0.08] relative z-10 flex justify-between items-center bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <BrainCircuit className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-sm font-semibold text-purple-300">AI Interviewer</span>
              </div>
              {(isVoice || isMixed) && ttsSupported && (
                <button
                  onClick={() => setTtsEnabled((v) => !v)}
                  className="rounded-lg p-2 hover:bg-white/[0.05] text-slate-400 transition-colors"
                >
                  {ttsEnabled ? <Volume2 className="h-4 w-4 text-purple-400" /> : <VolumeX className="h-4 w-4" />}
                </button>
              )}
            </div>

            <div className="flex-grow p-6 overflow-y-auto relative z-10">
              {isThinking ? (
                <div className="flex items-center gap-3 text-purple-400 animate-pulse">
                  <Activity className="h-5 w-5" />
                  <span className="text-sm font-medium">{thinkingText || "Analyzing and preparing..."}</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl sm:text-2xl font-semibold leading-relaxed text-white">
                    {currentQuestion?.question}
                  </h2>
                  {(isVoice || isMixed) && ttsSupported && (
                    <button
                      onClick={() => speak(currentQuestion?.question ?? "")}
                      disabled={speaking}
                      className="text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
                    >
                      {speaking ? "Speaking..." : "Play Audio"}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Panel: Answer Area */}
        <div className="flex flex-col lg:col-span-5 min-h-0">
          <div data-chaos-item="true" className="flex-grow rounded-2xl border border-white/[0.08] bg-[#0D1424] shadow-lg flex flex-col relative">
            
            {/* Answer Control Body */}
            {interviewMode === "TEXT" && (
              <div className="flex-grow flex flex-col p-6">
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type your answer here..."
                  disabled={isSubmitting}
                  className="flex-grow w-full bg-transparent text-white resize-none focus:outline-none placeholder-slate-600 text-[15px] leading-relaxed"
                />
              </div>
            )}

            {isVoice && (
              <VoicePanel
                answerText={answerText}
                setAnswerText={setAnswerText}
                isSubmitting={isSubmitting}
                showTextFallback={false}
              />
            )}

            {isMixed && (
              <div className="flex-grow flex flex-col">
                {/* Mode toggle buttons */}
                <div className="flex gap-2 p-4 border-b border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setMixedInputMode("voice")}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                      mixedInputMode === "voice"
                        ? "bg-purple-600 text-white shadow shadow-purple-900/40 ring-1 ring-purple-400/40"
                        : "bg-white/[0.05] text-slate-400 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    <Mic className="h-3.5 w-3.5" />
                    Answer with Voice
                  </button>
                  <button
                    type="button"
                    onClick={() => setMixedInputMode("text")}
                    className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                      mixedInputMode === "text"
                        ? "bg-purple-600 text-white shadow shadow-purple-900/40 ring-1 ring-purple-400/40"
                        : "bg-white/[0.05] text-slate-400 hover:bg-white/[0.08] hover:text-white"
                    }`}
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Type Answer
                  </button>
                </div>

                {/* Voice input */}
                {mixedInputMode === "voice" && (
                  <VoicePanel
                    answerText={answerText}
                    setAnswerText={setAnswerText}
                    isSubmitting={isSubmitting}
                    showTextFallback={false}
                  />
                )}

                {/* Text input */}
                {mixedInputMode === "text" && (
                  <div className="flex-grow flex flex-col p-6">
                    <textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      placeholder="Type your answer here..."
                      disabled={isSubmitting}
                      className="flex-grow w-full bg-transparent text-white resize-none focus:outline-none placeholder-slate-600 text-[15px] leading-relaxed"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="p-4 border-t border-white/[0.08] bg-white/[0.02] flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => submitAnswer(true)}
                  disabled={isSubmitting}
                  className="text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Skip Question
                </button>
              </div>
              <button
                onClick={() => submitAnswer(false)}
                disabled={isSubmitting || answerText.trim().length === 0}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-900/30 transition-all hover:brightness-110 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? "Sending..." : "Submit Answer"}
                {!isSubmitting && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Live Metrics */}
        <div className="flex flex-col lg:col-span-3 min-h-0 gap-6">
          
          {/* Progress Card */}
          <div data-chaos-item="true" className="rounded-2xl border border-white/[0.08] bg-[#0D1424] p-5 shadow-lg">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-3">Interview Progress</p>
            <div className="flex items-end justify-between mb-2">
              <span className="text-2xl font-bold text-white tabular-nums">
                {currentIndex + 1} <span className="text-slate-500 text-lg">/ {questionLimit}</span>
              </span>
              <span className="text-xs text-purple-400 font-medium">{Math.round(progressPercent)}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {/* Time Card */}
          <div data-chaos-item="true" className="rounded-2xl border border-white/[0.08] bg-[#0D1424] p-5 shadow-lg flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Time Remaining</p>
              <span className={`text-2xl font-bold tabular-nums ${timeRemaining && timeRemaining < 300 ? "text-red-400" : "text-white"}`}>
                {timeRemaining !== null ? formatTime(timeRemaining) : "--:--"}
              </span>
            </div>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${timeRemaining && timeRemaining < 300 ? "bg-red-500/10 text-red-400" : "bg-white/[0.04] text-slate-400"}`}>
              <Clock className="h-5 w-5" />
            </div>
          </div>

          {/* Settings / Mode Card */}
          <div data-chaos-item="true" className="rounded-2xl border border-white/[0.08] bg-[#0D1424] p-5 shadow-lg flex-grow flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-4">Session Info</p>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Role</p>
                  <p className="text-sm font-medium text-white truncate">{interview.role}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-1">Mode</p>
                  <div className="flex items-center gap-2 text-sm font-medium text-white">
                    {isVoice || isMixed ? <Mic className="h-4 w-4 text-purple-400" /> : <Layout className="h-4 w-4 text-slate-400" />}
                    {interviewMode}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowEndDialog(true)}
              className="mt-6 w-full rounded-xl border border-red-500/20 bg-red-500/10 py-3 text-sm font-semibold text-red-400 transition-colors hover:bg-red-500/20"
            >
              End Interview
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
