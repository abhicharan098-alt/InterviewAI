"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Mic, MicOff, Target, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/dashboard/Reveal";
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

function VoicePanel({
  answerText,
  setAnswerText,
  isSubmitting,
}: {
  answerText: string;
  setAnswerText: (v: string) => void;
  isSubmitting: boolean;
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
      <div className="flex flex-col items-center justify-center p-6 text-center border rounded-xl border-white/[0.1] bg-white/[0.03]">
        <MicOff className="h-8 w-8 text-slate-500 mb-2" />
        <p className="text-sm text-slate-400">
          Voice input is not supported in this browser. Please use the text input below.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-4 py-4">
        <button
          onClick={toggleListening}
          disabled={isSubmitting}
          className={`relative flex h-20 w-20 items-center justify-center rounded-full transition-all duration-200 ${
            listening
              ? "bg-red-500 shadow-[0_0_0_12px_rgba(239,68,68,0.15)] hover:bg-red-600"
              : "bg-gradient-to-br from-purple-600 to-violet-600 shadow-lg shadow-purple-950/40 hover:brightness-110"
          }`}
        >
          {listening ? <MicOff className="h-8 w-8 text-white" /> : <Mic className="h-8 w-8 text-white" />}
        </button>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${listening ? 'bg-red-500/20 text-red-400' : 'bg-purple-500/20 text-purple-400'}`}>
          {listening ? "Recording..." : "Tap to Speak"}
        </span>
      </div>

      {(answerText || interim) && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-sm leading-relaxed text-white min-h-[80px]">
          {answerText}
          {interim && <span className="text-slate-400"> {interim}</span>}
        </div>
      )}
    </div>
  );
}

export default function FocusPracticeSessionPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [interview, setInterview] = useState<any>(null);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [answerText, setAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("DRAFT");
  const [showEndFocusModal, setShowEndFocusModal] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await fetch(`/api/interviews/${id}`);
        const data = await res.json();
        if (data.interview) {
          setInterview(data.interview);
          setStatus(data.interview.status);
          const questions = data.interview.questions || [];
          const answeredIds = data.interview.answers?.map((a: any) => a.questionId) || [];
          
          let activeQ = null;
          for (const q of questions) {
            if (!answeredIds.includes(q.id)) {
              activeQ = q;
              break;
            }
          }
          if (!activeQ && questions.length > 0) activeQ = questions[questions.length - 1];
          setCurrentQuestion(activeQ);
          
          if (data.interview.status === "COMPLETED") {
            setIsComplete(true);
          } else {
            if (data.interview.status === "PAUSED") {
              setTimeRemaining(data.interview.remainingSeconds ?? (data.interview.durationMinutes * 60));
              setShowReminderModal(true);
            } else if (data.interview.resumedAt || data.interview.startedAt) {
              const startTime = new Date(data.interview.resumedAt || data.interview.startedAt).getTime();
              const rem = data.interview.remainingSeconds ?? (data.interview.durationMinutes * 60);
              const elapsed = Math.floor((Date.now() - startTime) / 1000);
              setTimeRemaining(Math.max(0, rem - elapsed));
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch interview", err);
      }
    };
    fetchInterview();
  }, [id]);

  useEffect(() => {
    if (status !== "IN_PROGRESS" || timeRemaining === null) return;
    if (timeRemaining <= 0) {
      setIsComplete(true);
      return;
    }
    const interval = setInterval(() => {
      setTimeRemaining((t) => (t !== null && t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [timeRemaining, status]);

  const handleSubmit = async () => {
    if (!answerText.trim() || !currentQuestion) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/interviews/focus-practice/next`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId: id,
          questionId: currentQuestion.id,
          answerText,
          durationSec: 30,
        }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setFeedback(data.evaluation);
        if (data.isComplete) {
          setIsComplete(true);
        } else if (data.nextQuestion) {
          setCurrentQuestion(data.nextQuestion);
          setInterview((prev: any) => ({
            ...prev,
            questions: [...prev.questions, data.nextQuestion]
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!currentQuestion) return;
    setIsSubmitting(true);
    
    try {
      const res = await fetch(`/api/interviews/focus-practice/next`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          interviewId: id,
          questionId: currentQuestion.id,
          answerText: "[SKIPPED]",
          durationSec: 0,
        }),
      });
      const data = await res.json();
      
      if (res.ok) {
        setFeedback(data.evaluation);
        if (data.isComplete) {
          setIsComplete(true);
        } else if (data.nextQuestion) {
          setCurrentQuestion(data.nextQuestion);
          setInterview((prev: any) => ({
            ...prev,
            questions: [...prev.questions, data.nextQuestion]
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (isComplete) {
      router.push(`/focus-practice/result/${id}`);
    } else {
      setAnswerText("");
      setFeedback(null);
    }
  };

  const handleEndFocus = async () => {
    if (isEnding) return;
    setIsEnding(true);
    try {
      const res = await fetch(`/api/interviews/${id}/complete`, { method: "POST" });
      if (res.ok) {
        setIsComplete(true);
        router.push(`/focus-practice/result/${id}`);
      } else {
        setIsEnding(false);
        setShowEndFocusModal(false);
      }
    } catch (e) {
      console.error(e);
      setIsEnding(false);
      setShowEndFocusModal(false);
    }
  };

  if (!interview || !currentQuestion) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
        <span className="text-sm text-slate-400 font-medium">Loading session...</span>
      </div>
    );
  }

  const isVoiceMode = interview.mode === "VOICE" || interview.mode === "MIXED";

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {showReminderModal && (
        <InterviewPauseModal
          interviewId={id as string}
          interviewType="FOCUS_PRACTICE"
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

      {showEndFocusModal && (
        <div 
          className="fixed top-0 left-0 z-[9999] flex h-[100dvh] w-[100vw] items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEndFocusModal(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowEndFocusModal(false);
          }}
        >
          <div 
            className="w-full max-w-md overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0D1424] shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="end-focus-title"
          >
            <div className="p-6">
              <h2 id="end-focus-title" className="text-xl font-bold text-white mb-2">End Focus?</h2>
              <p className="text-slate-400 mb-6">Are you sure you want to end this focused practice session?</p>
              
              <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={() => setShowEndFocusModal(false)}
                  disabled={isEnding}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  Continue
                </button>
                <button
                  onClick={handleEndFocus}
                  disabled={isEnding}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white bg-red-500/80 border border-red-500/20 hover:bg-red-500 hover:border-red-500/40 transition-all flex items-center justify-center disabled:opacity-50"
                >
                  {isEnding ? <Loader2 className="h-4 w-4 animate-spin" /> : "End Focus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <button 
        onClick={async (e) => {
          if (!isComplete && status === "IN_PROGRESS") {
            e.preventDefault();
            try {
              await fetch(`/api/interviews/${id}/pause`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ remainingSeconds: timeRemaining }),
              });
              setStatus("PAUSED");
            } catch (err) {
              console.error("Failed to pause", err);
            }
            setShowReminderModal(true);
          } else {
            router.push("/focus-areas");
          }
        }}
        className="inline-flex items-center text-sm text-slate-400 hover:text-white mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {status === "IN_PROGRESS" && !isComplete ? "Pause / Exit Interview" : "Back to Focus Areas"}
      </button>
      
      <Reveal>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Focus Practice</h1>
          <p className="text-slate-400">Improve the skills you selected through targeted AI questions.</p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 md:p-8 shadow-2xl mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-violet-500" />
          
          <div className="flex justify-between items-center mb-6 text-sm font-medium">
            <span className="text-purple-400 uppercase tracking-wider bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20">
              {currentQuestion.category}
            </span>
            <div className="flex items-center gap-4 text-slate-400">
              {timeRemaining !== null && (
                <span className={`font-mono ${timeRemaining < 60 ? 'text-red-400 animate-pulse' : ''}`}>
                  {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, "0")}
                </span>
              )}
              <span>
                Question {currentQuestion.questionNumber} of {interview.questionCount}
              </span>
            </div>
          </div>
          
          <h2 className="text-xl md:text-2xl font-semibold text-white leading-relaxed mb-8">
            {currentQuestion.question}
          </h2>

          {feedback ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="rounded-xl bg-white/5 border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-white">AI Feedback</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Score:</span>
                    <span className={`font-bold ${feedback.score >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {feedback.score}%
                    </span>
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="bg-[#050814] rounded-lg p-4 border border-white/5">
                    <div className="text-emerald-400 text-sm font-bold mb-1">✓ Strength</div>
                    <p className="text-sm text-slate-300">{feedback.strength}</p>
                  </div>
                  <div className="bg-[#050814] rounded-lg p-4 border border-white/5">
                    <div className="text-amber-400 text-sm font-bold mb-1">⚠ Improve</div>
                    <p className="text-sm text-slate-300">{feedback.weakness}</p>
                  </div>
                  <div className="bg-[#050814] rounded-lg p-4 border border-white/5">
                    <div className="text-blue-400 text-sm font-bold mb-1">💡 Try this</div>
                    <p className="text-sm text-slate-300">{feedback.suggestion}</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleNext}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-3.5 font-semibold text-white hover:brightness-110 transition-all"
              >
                {isComplete ? "View Final Report" : "Next Question"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {isVoiceMode && (
                <VoicePanel answerText={answerText} setAnswerText={setAnswerText} isSubmitting={isSubmitting} />
              )}
              
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 ml-1">
                  {isVoiceMode ? "Or Type Your Answer" : "Your Answer"}
                </label>
                <textarea
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full min-h-[120px] rounded-xl border border-white/[0.1] bg-white/[0.03] p-4 text-white placeholder-slate-500 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/50"
                />
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleSkip}
                  disabled={isSubmitting}
                  className="w-1/3 flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.02] py-3.5 font-semibold text-white hover:bg-white/[0.06] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Skip
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!answerText.trim() || isSubmitting}
                  className="w-2/3 flex items-center justify-center gap-2 rounded-xl bg-white/10 py-3.5 font-semibold text-white hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Answer"}
                </button>
              </div>
            </div>
          )}
        </div>
      </Reveal>
      
      {!isComplete && (
        <div className="mt-4 flex justify-center pb-8">
          <button
            onClick={() => setShowEndFocusModal(true)}
            className="rounded-full border border-white/5 bg-black/20 px-6 py-2.5 text-sm font-medium text-slate-400 transition-all hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/50"
          >
            End Focus
          </button>
        </div>
      )}
    </div>
  );
}
