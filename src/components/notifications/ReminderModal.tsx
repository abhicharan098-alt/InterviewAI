"use client";

import { useState } from "react";
import { Clock, X, Bell, CheckCircle2 } from "lucide-react";

interface Props {
  interviewId: string;
  type: "NORMAL_PRACTICE_REMINDER" | "FOCUS_PRACTICE_REMINDER";
  onClose: () => void;
  onSkip?: () => void;
}

const PRESET_OPTIONS = [
  { label: "30 minutes",  minutes: 30 },
  { label: "1 hour",      minutes: 60 },
  { label: "3 hours",     minutes: 180 },
  { label: "Tomorrow",    minutes: 1440 },
];

export function ReminderModal({ interviewId, type, onClose, onSkip }: Props) {
  const [selected, setSelected] = useState<number | null>(60);
  const [custom, setCustom] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const minutes = selected ?? (custom ? parseInt(custom) : 60);
      const scheduledFor = new Date(Date.now() + minutes * 60 * 1000).toISOString();

      const res = await fetch("/api/notifications/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId, type, scheduledFor }),
      });

      if (!res.ok) throw new Error("Failed to save reminder");

      // Request browser notification permission
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }

      setSaved(true);
      setTimeout(onClose, 1500);
    } catch {
      setError("Failed to save reminder. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed top-0 left-0 z-[9999] flex h-[100dvh] w-[100vw] items-center justify-center bg-[#050814]/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1120] shadow-2xl shadow-purple-900/30">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
              <Bell className="h-4 w-4 text-purple-400" />
            </div>
            <span className="font-semibold text-white">Set a Reminder</span>
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
              <p className="mt-1 text-sm text-slate-400">We&apos;ll remind you when it&apos;s time to continue.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-400 mb-4">
                Remind me to continue this practice session in:
              </p>

              {/* Preset options */}
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

              {/* Custom */}
              <div className="mb-5">
                <label className="mb-1.5 block text-xs font-medium text-slate-500">Custom (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="10080"
                  placeholder="e.g. 90"
                  value={custom}
                  onChange={(e) => { setCustom(e.target.value); setSelected(null); }}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                />
              </div>

              {error && <p className="mb-3 text-xs text-red-400">{error}</p>}

              <div className="flex gap-3">
                <button
                  onClick={onSkip || onClose}
                  className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.02] py-3 text-sm font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                >
                  Skip
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || (!selected && !custom)}
                  className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 py-3 text-sm font-semibold text-white transition disabled:opacity-50 hover:brightness-110"
                >
                  {saving ? "Saving..." : "Set Reminder"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}