"use client";

import { Bell, X, CheckCheck, ArrowRight, Clock, Star, Target, Zap, Trophy, Lightbulb, Flame } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl: string | null;
  read: boolean;
  createdAt: string;
  scheduledFor: string | null;
  triggeredAt: string | null;
}

const TYPE_ICONS: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  NORMAL_PRACTICE_REMINDER: { icon: Target, color: "text-purple-400" },
  FOCUS_PRACTICE_REMINDER:  { icon: Target, color: "text-violet-400" },
  INTERVIEW_RESULT:         { icon: Zap,    color: "text-blue-400" },
  PERSONAL_BEST:            { icon: Star,   color: "text-yellow-400" },
  DAILY_TIP:                { icon: Lightbulb, color: "text-green-400" },
  PRACTICE_STREAK:          { icon: Flame,  color: "text-orange-400" },
  ACHIEVEMENT:              { icon: Trophy, color: "text-amber-400" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "yesterday" : `${d}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [triggered, setTriggered] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchUnread = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count");
      const data = await res.json();
      setUnread(data.count || 0);
    } catch {}
  }, []);

  const checkReminders = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/check-reminders");
      const data = await res.json();
      setUnread(data.unreadCount || 0);
      if (data.recent) setNotifications(data.recent);
      // Surface triggered reminders as browser notifications if permitted
      if (data.triggered?.length > 0) {
        setTriggered(data.triggered);
        if ("Notification" in window && Notification.permission === "granted") {
          for (const n of data.triggered) {
            new Notification(n.title, { body: n.message, icon: "/favicon.ico" });
          }
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [checkReminders]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openDropdown = async () => {
    setOpen((v) => !v);
    if (!open) {
      setLoading(true);
      try {
        const res = await fetch("/api/notifications/check-reminders");
        const data = await res.json();
        setNotifications(data.recent || []);
        setUnread(data.unreadCount || 0);
      } catch {}
      setLoading(false);
    }
  };

  const markRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
      setUnread((prev) => Math.max(0, prev - 1));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    } catch {}
  };

  const clearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/clear-all", { method: "DELETE" });
      if (res.ok) {
        setNotifications([]);
        setUnread(0);
        window.dispatchEvent(new Event("notifications_cleared"));
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    const handleCleared = () => {
      setNotifications([]);
      setUnread(0);
    };
    window.addEventListener("notifications_cleared", handleCleared);
    return () => window.removeEventListener("notifications_cleared", handleCleared);
  }, []);

  const handleClick = async (n: Notification) => {
    if (!n.read) await markRead(n.id);
    if (n.actionUrl) {
      router.push(n.actionUrl);
      setOpen(false);
    }
  };

  const dismissTriggered = (id: string) => {
    setTriggered((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Triggered reminder toasts */}
      {triggered.map((t) => (
        <div
          key={t.id}
          className="fixed right-6 top-20 z-[300] flex max-w-sm items-start gap-3 rounded-xl border border-purple-500/30 bg-[#0D1424] p-4 shadow-2xl shadow-purple-900/30 animate-in fade-in slide-in-from-top-3"
          style={{ marginTop: triggered.indexOf(t) * 80 }}
        >
          <Target className="mt-0.5 h-5 w-5 shrink-0 text-purple-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">{t.title}</p>
            <p className="mt-0.5 text-xs text-slate-400 line-clamp-2">{t.message}</p>
            {t.actionUrl && (
              <button
                onClick={() => { router.push(t.actionUrl!); dismissTriggered(t.id); }}
                className="mt-2 rounded-lg bg-purple-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-purple-500"
              >
                Continue Practice
              </button>
            )}
          </div>
          <button onClick={() => dismissTriggered(t.id)} className="text-slate-500 hover:text-slate-300 transition">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}

      {/* Bell button */}
      <button
        id="notification-bell"
        onClick={openDropdown}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/[0.03] text-slate-300 transition-all hover:bg-white/[0.08] hover:text-white"
        aria-label="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute right-[7px] top-[7px] flex h-2.5 w-2.5 items-center justify-center rounded-full bg-purple-500">
            <span className="absolute h-full w-full animate-ping rounded-full bg-purple-400 opacity-60" />
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 z-[200] w-80 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B1120] shadow-2xl shadow-purple-900/20 animate-in fade-in slide-in-from-top-2">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-semibold text-white">Notifications</span>
              {unread > 0 && (
                <span className="rounded-full bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-400">
                  {unread}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-purple-400 transition"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-red-400 transition"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04]">
                  <Bell className="h-5 w-5 text-slate-500" />
                </div>
                <p className="text-sm font-medium text-slate-300">You&apos;re all caught up</p>
                <p className="mt-1 text-xs text-slate-500">No new notifications</p>
              </div>
            ) : (
              notifications.map((n) => {
                const typeInfo = TYPE_ICONS[n.type] || { icon: Bell, color: "text-slate-400" };
                const Icon = typeInfo.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`group flex w-full items-start gap-3 px-4 py-3.5 text-left transition hover:bg-white/[0.04] ${!n.read ? "bg-purple-500/5" : ""}`}
                  >
                    <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] ${typeInfo.color}`}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-xs font-semibold leading-snug ${n.read ? "text-slate-300" : "text-white"}`}>{n.title}</p>
                        {!n.read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-purple-500" />}
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-slate-500">{n.message}</p>
                      <p className="mt-1 flex items-center gap-1 text-[10px] text-slate-600">
                        <Clock className="h-2.5 w-2.5" />
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.06] px-4 py-3">
            <button
              onClick={() => { router.push("/notifications"); setOpen(false); }}
              className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-purple-400 hover:text-purple-300 transition"
            >
              View all notifications
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}