"use client";

import { useState, useEffect } from "react";
import { Clock, X, Bell, CheckCircle2, PlayCircle, PauseCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  interviewId: string;
  interviewType: string;
  interviewRole?: string;
  existingReminder?: { id: string; scheduledFor: Date } | null;
  onClose: () => void;
  onResume?: () => void;
  onSaved?: () => void;
  standalone?: boolean;
}

const PRESET_OPTIONS = [
  { label: "1 minute", minutes: 1 },
  { label: "5 minutes", minutes: 5 },
  { label: "15 minutes", minutes: 15 },
  { label: "30 minutes", minutes: 30 },
  { label: "1 hour", minutes: 60 },
];

export function InterviewPauseModal({ interviewId, interviewType, interviewRole, existingReminder, onClose, onResume, onSaved, standalone }: Props) {
  const router = useRouter();
  
  const [view, setView] = useState<"PAUSED" | "REMINDER">(standalone ? "REMINDER" : "PAUSED");
  const [selected, setSelected] = useState<number | null>(60);
  const [custom, setCustom] = useState("");
  const [saving, setSaving] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const minutes = selected ?? (custom ? parseInt(custom) : 60);
      const scheduledFor = new Date(Date.now() + minutes * 60 * 1000).toISOString();
      const notifType = interviewType === "FOCUS_PRACTICE" ? "FOCUS_PRACTICE_REMINDER" : "NORMAL_PRACTICE_REMINDER";

      const res = await fetch("/api/notifications/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId, type: notifType, scheduledFor }),
      });

      if (!res.ok) throw new Error("Failed to save reminder");

      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }

      setSaved(true);
      setTimeout(() => {
        if (standalone) {
          onSaved?.();
          onClose();
        } else {
          if (interviewType === "FOCUS_PRACTICE") {
            router.push("/focus-areas");
          } else {
            router.push("/interviews");
          }
        }
      }, 1500);
    } catch {
      setError("Failed to save reminder. Please try again.");
      setSaving(false);
    }
  };

  const handleCancelReminder = async () => {
    setCancelling(true);
    setError("");
    try {
      const res = await fetch(`/api/notifications/reminders?interviewId=${interviewId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to cancel reminder");
      
      if (standalone) {
        onSaved?.();
        onClose();
      } else {
        setView("PAUSED");
      }
    } catch {
      setError("Failed to cancel reminder.");
      setCancelling(false);
    }
  };

  const handleSkipReminder = () => {
    if (interviewType === "FOCUS_PRACTICE") {
      router.push("/focus-areas");
    } else {
      router.push("/interviews");
    }
  };

  const formatExistingTime = (d: Date) => {
    return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-[#050814]/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1120] shadow-2xl shadow-purple-900/30">
        
        {view === "PAUSED" && !standalone && (
          <div className="px-6 py-8 text-center">
            <PauseCircle className="h-16 w-16 text-purple-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Interview Paused</h2>
            <p className="text-sm text-slate-400 mb-8">
              Your progress and remaining time are securely saved. You can safely close this page.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setView("REMINDER")}
                className="w-full rounded-xl bg-purple-500/10 border border-purple-500/20 py-3 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/20"
              >
                🔔 Remind Me Later
              </button>
              <button
                onClick={handleSkipReminder}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.02] py-3 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
              >
                Exit Without Reminder
              </button>
              {onResume && (
                <button
                  onClick={onResume}
                  className="w-full mt-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-semibold text-white transition hover:brightness-110 flex items-center justify-center gap-2"
                >
                  <PlayCircle className="h-4 w-4" />
                  Resume Now
                </button>
              )}
            </div>
          </div>
        )}

        {view === "REMINDER" && (
          <>
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
                  <Bell className="h-4 w-4 text-purple-400" />
                </div>
                <span className="font-semibold text-white">
                  {existingReminder ? "Change Reminder" : "Set a Reminder"}
                </span>
              </div>
              <button onClick={onClose} className="text-slate-500 transition hover:text-slate-300">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-6 py-5">
              {saved ? (
                <div className="flex flex-col items-center py-4 text-center">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400 mb-3" />
                  <p className="font-semibold text-white">Reminder Set!</p>
                  <p className="mt-1 text-sm text-slate-400">We'll remind you when it's time to continue.</p>
                </div>
              ) : (
                <>
                  {interviewRole && (
                    <p className="text-sm font-medium text-white mb-2 text-center">
                      {interviewRole}
                    </p>
                  )}
                  {existingReminder ? (
                    <p className="text-sm text-purple-300 mb-4 text-center bg-purple-500/10 py-2 rounded-lg border border-purple-500/20">
                      Reminder already set for {formatExistingTime(existingReminder.scheduledFor)}
                    </p>
                  ) : (
                    <p className="text-sm text-slate-400 mb-4">
                      Remind me to continue this practice session in:
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {PRESET_OPTIONS.map((opt) => (
                      <button
                        key={opt.minutes}
                        onClick={() => { setSelected(opt.minutes); setCustom(""); }}
                        className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                          selected === opt.minutes
                            ? "border-purple-500 bg-purple-500/10 text-purple-300"
                            : "border-white/[0.08] bg-white/[0.02] text-slate-400 hover:border-white/[0.15] hover:text-white"
                        }`}
                      >
                        <Clock className="h-4 w-4 mx-auto mb-1 opacity-70" />
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  <div className="mb-5">
                    <label className="mb-1.5 block text-xs font-medium text-slate-500">Custom (minutes)</label>
                    <input
                      type="number"
                      min="1"
                      max="10080"
                      placeholder="e.g. 90"
                      value={custom}
                      onChange={(e) => { setCustom(e.target.value); setSelected(null); }}
                      className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                    />
                  </div>

                  {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      {!standalone && (
                        <button
                          onClick={() => setView("PAUSED")}
                          className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.02] py-3 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                        >
                          Back
                        </button>
                      )}
                      <button
                        onClick={handleSave}
                        disabled={saving || (!selected && !custom)}
                        className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-3 text-sm font-semibold text-white transition disabled:opacity-50 hover:brightness-110"
                      >
                        {saving ? "Saving..." : (existingReminder ? "Change Reminder" : "Set Reminder")}
                      </button>
                    </div>
                    {existingReminder && (
                      <button
                        onClick={handleCancelReminder}
                        disabled={cancelling}
                        className="w-full rounded-xl border border-red-500/20 bg-red-500/10 py-3 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        {cancelling ? "Cancelling..." : "Cancel Reminder"}
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}