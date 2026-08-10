"use client";

import { useEffect, useState } from "react";
import {
  Settings, User, Bell, Shield, ChevronDown, ChevronUp,
  Save, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2,
  Target, Zap, Star, Lightbulb, Flame, Trophy
} from "lucide-react";

interface NotifSettings {
  notifyNormalReminder: boolean;
  notifyFocusReminder: boolean;
  notifyResult: boolean;
  notifyPersonalBest: boolean;
  notifyDailyTip: boolean;
  notifyStreak: boolean;
  notifyAchievement: boolean;
  browserNotifications: boolean;
  dailyTipTime: string;
  defaultReminderMinutes: number;
}

interface SettingsData {
  user: { name: string; email: string };
  notifSettings: NotifSettings;
}

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        checked ? "bg-purple-600" : "bg-white/[0.1]"
      }`}
    >
      <span
        className={`inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
        style={{ width: 18, height: 18 }}
      />
    </button>
  );
}

function Section({ title, icon: Icon, children, defaultOpen = true }: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div data-chaos-item="true" className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1120]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10">
            <Icon className="h-4 w-4 text-purple-400" />
          </div>
          <span className="font-semibold text-white">{title}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
      </button>
      {open && <div className="border-t border-white/[0.06] px-6 py-5">{children}</div>}
    </div>
  );
}

const NOTIF_TYPES = [
  { key: "notifyNormalReminder", icon: Target, label: "Practice Reminders", desc: "Reminders to continue unfinished practice sessions" },
  { key: "notifyFocusReminder",  icon: Target, label: "Focus Practice Reminders", desc: "Reminders to continue unfinished focus practice sessions" },
  { key: "notifyResult",         icon: Zap,    label: "Interview Results", desc: "Notification when your interview report is ready" },
  { key: "notifyPersonalBest",   icon: Star,   label: "Personal Best", desc: "Notify when you beat your highest score" },
  { key: "notifyDailyTip",       icon: Lightbulb, label: "Daily Interview Tips", desc: "One premium interview tip every day" },
  { key: "notifyStreak",         icon: Flame,  label: "Practice Streaks", desc: "Celebrate streak milestones (3, 7, 14, 30 days)" },
  { key: "notifyAchievement",    icon: Trophy, label: "Achievements", desc: "Unlock achievements as you reach milestones" },
];

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Profile fields
  const [name, setName] = useState("");
  const [hasPassword, setHasPassword] = useState(true);

  // Password fields
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  // Notif settings state
  const [notif, setNotif] = useState<NotifSettings>({
    notifyNormalReminder: true,
    notifyFocusReminder: true,
    notifyResult: true,
    notifyPersonalBest: true,
    notifyDailyTip: true,
    notifyStreak: true,
    notifyAchievement: true,
    browserNotifications: false,
    dailyTipTime: "09:00",
    defaultReminderMinutes: 60,
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setName(d.user?.name || "");
        setHasPassword(Boolean(d.user?.hasPassword));
        if (d.notifSettings) setNotif(d.notifSettings);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed");
      showToast("success", "Profile updated successfully");
    } catch {
      showToast("error", "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (newPw !== confirmPw) { showToast("error", "New passwords do not match"); return; }
    if (newPw.length < 8) { showToast("error", "Password must be at least 8 characters"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed");
      showToast("success", "Password changed successfully");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: any) {
      showToast("error", err.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  const saveNotifSettings = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notif),
      });
      if (!res.ok) throw new Error("Failed");
      showToast("success", "Notification settings saved");
    } catch {
      showToast("error", "Failed to save notification settings");
    } finally {
      setSaving(false);
    }
  };

  const handleBrowserNotif = async (v: boolean) => {
    if (v && "Notification" in window) {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        showToast("error", "Browser notifications blocked. Please allow them in your browser settings.");
        return;
      }
    }
    setNotif((prev) => ({ ...prev, browserNotifications: v }));
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed right-6 top-20 z-[500] flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-2xl animate-in fade-in slide-in-from-top-2 ${
          toast.type === "success"
            ? "border-emerald-500/30 bg-[#0D1424] text-emerald-300"
            : "border-red-500/30 bg-[#0D1424] text-red-300"
        }`}>
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">Manage your account, preferences, and notifications</p>
      </div>

      {/* Profile Section */}
      <Section title="Profile" icon={User}>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Full Name</label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Email</label>
            <input
              type="email"
              value={data?.user?.email || ""}
              disabled
              className="w-full rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
            />
          </div>
          <button
            id="save-profile-btn"
            onClick={saveProfile}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </Section>

      {/* Notifications Section */}
      <Section title="Notifications" icon={Bell}>
        <div className="space-y-5">
          <div className="space-y-4">
            {NOTIF_TYPES.map(({ key, icon: Icon, label, desc }) => (
              <div key={key} className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
                    <Icon className="h-3.5 w-3.5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-200">{label}</p>
                    <p className="text-xs text-slate-500">{desc}</p>
                  </div>
                </div>
                <Toggle
                  id={`toggle-${key}`}
                  checked={notif[key as keyof NotifSettings] as boolean}
                  onChange={(v) => setNotif((prev) => ({ ...prev, [key]: v }))}
                />
              </div>
            ))}
          </div>

          <div className="border-t border-white/[0.06] pt-5 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-200">Browser Notifications</p>
                <p className="text-xs text-slate-500">Show desktop notifications for reminders (requires permission)</p>
              </div>
              <Toggle
                id="toggle-browser"
                checked={notif.browserNotifications}
                onChange={handleBrowserNotif}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Daily Tip Time</label>
              <input
                id="daily-tip-time"
                type="time"
                value={notif.dailyTipTime}
                onChange={(e) => setNotif((prev) => ({ ...prev, dailyTipTime: e.target.value }))}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-white focus:border-purple-500/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Default Reminder Time</label>
              <select
                id="default-reminder"
                value={notif.defaultReminderMinutes}
                onChange={(e) => setNotif((prev) => ({ ...prev, defaultReminderMinutes: parseInt(e.target.value) }))}
                className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:border-purple-500/50 focus:outline-none [&>option]:bg-[#0B1120]"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={180}>3 hours</option>
                <option value={1440}>Tomorrow</option>
              </select>
            </div>
          </div>

          <button
            id="save-notif-btn"
            onClick={saveNotifSettings}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Notification Settings"}
          </button>
        </div>
      </Section>

      {/* Security Section */}
      <Section title="Security" icon={Shield} defaultOpen={false}>
        <div className="space-y-4">
          <p className="text-sm text-slate-400">
            {hasPassword
              ? "Change your password. You must enter your current password to set a new one."
              : "You signed in with Google. Set a password below to also sign in with your email and password."}
          </p>
          {hasPassword && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Current Password</label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 pr-11 text-sm text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                  placeholder="••••••••"
                />
                <button
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">New Password</label>
            <div className="relative">
              <input
                id="new-password"
                type={showNewPw ? "text" : "password"}
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 pr-11 text-sm text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                placeholder="At least 8 characters"
              />
              <button
                onClick={() => setShowNewPw(!showNewPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPw}
              onChange={(e) => setConfirmPw(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
              placeholder="••••••••"
            />
          </div>
          <button
            id="change-password-btn"
            onClick={savePassword}
            disabled={saving || !newPw || !confirmPw || (hasPassword && !currentPw)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
          >
            <Shield className="h-4 w-4" />
            {saving ? "Saving..." : hasPassword ? "Change Password" : "Set Password"}
          </button>
        </div>
      </Section>
    </div>
  );
}
