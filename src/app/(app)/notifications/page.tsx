"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bell, Target, Zap, Star, Lightbulb, Flame, Trophy,
  CheckCheck, Trash2, Clock, X, Filter
} from "lucide-react";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl: string | null;
  read: boolean;
  createdAt: string;
}

const TYPE_META: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string; label: string }> = {
  NORMAL_PRACTICE_REMINDER: { icon: Target,    color: "text-purple-400 bg-purple-500/10", label: "Practice Reminder" },
  FOCUS_PRACTICE_REMINDER:  { icon: Target,    color: "text-violet-400 bg-violet-500/10", label: "Focus Reminder" },
  INTERVIEW_RESULT:         { icon: Zap,       color: "text-blue-400 bg-blue-500/10",     label: "Result" },
  PERSONAL_BEST:            { icon: Star,      color: "text-yellow-400 bg-yellow-500/10", label: "Personal Best" },
  DAILY_TIP:                { icon: Lightbulb, color: "text-green-400 bg-green-500/10",   label: "Daily Tip" },
  PRACTICE_STREAK:          { icon: Flame,     color: "text-orange-400 bg-orange-500/10", label: "Streak" },
  ACHIEVEMENT:              { icon: Trophy,    color: "text-amber-400 bg-amber-500/10",   label: "Achievement" },
};

const TABS = [
  { key: "all",          label: "All" },
  { key: "unread",       label: "Unread" },
  { key: "practice",    label: "Practice" },
  { key: "results",     label: "Results" },
  { key: "achievements",label: "Achievements" },
];

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

export default function NotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notifications?page=${page}&filter=${filter}`);
      const data = await res.json();
      setNotifications(data.notifications || []);
      setTotalPages(data.totalPages || 1);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
    setLoading(false);
  }, [page, filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleTabChange = (key: string) => {
    setFilter(key);
    setPage(1);
  };

  const markRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const deleteNotif = async (id: string, wasRead: boolean) => {
    await fetch(`/api/notifications/${id}`, { method: "DELETE" });
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (!wasRead) setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const clearAll = async () => {
    if (!window.confirm("Are you sure you want to clear all notifications?")) return;
    setIsClearing(true);
    try {
      const res = await fetch("/api/notifications/clear-all", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to clear");
      setNotifications([]);
      setUnreadCount(0);
      setTotalPages(1);
      
      // Dispatch custom event to sync with NotificationBell
      window.dispatchEvent(new Event("notifications_cleared"));
    } catch (error) {
      console.error(error);
      alert("Failed to clear notifications. Please try again.");
    }
    setIsClearing(false);
  };

  const handleClick = async (n: Notification) => {
    if (!n.read) await markRead(n.id);
    if (n.actionUrl) router.push(n.actionUrl);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
            <p className="mt-1 text-sm text-slate-400">
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "All caught up!"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                <CheckCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                disabled={isClearing}
                className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">{isClearing ? "Clearing..." : "Clear All"}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              filter === tab.key
                ? "bg-purple-500/15 text-purple-300"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
            <Bell className="h-8 w-8 text-slate-600" />
          </div>
          <p className="text-lg font-semibold text-slate-300">No notifications here</p>
          <p className="mt-2 text-sm text-slate-500">
            {filter === "unread" ? "You're all caught up!" : "Notifications will appear here as you practice."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const meta = TYPE_META[n.type] || { icon: Bell, color: "text-slate-400 bg-white/[0.04]", label: n.type };
            const Icon = meta.icon;
            return (
              <div
                key={n.id}
                className={`group relative overflow-hidden rounded-2xl border transition-all ${
                  n.read
                    ? "border-white/[0.06] bg-white/[0.02]"
                    : "border-purple-500/20 bg-purple-500/5"
                }`}
              >
                <button
                  onClick={() => handleClick(n)}
                  className="flex w-full items-start gap-4 p-5 text-left"
                >
                  <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${meta.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-purple-500" />}
                          <p className={`text-sm font-semibold ${n.read ? "text-slate-200" : "text-white"}`}>
                            {n.title}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-slate-400 leading-relaxed">{n.message}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="flex items-center gap-1 text-xs text-slate-600">
                        <Clock className="h-3 w-3" />
                        {timeAgo(n.createdAt)}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${meta.color}`}>
                        {meta.label}
                      </span>
                    </div>
                  </div>
                </button>

                {/* Action buttons */}
                <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {!n.read && (
                    <button
                      onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                      title="Mark as read"
                      className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/[0.08] hover:text-slate-300"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotif(n.id, n.read); }}
                    title="Delete"
                    className="rounded-lg p-1.5 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-sm text-slate-400 transition hover:text-white disabled:opacity-30"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">Page {page} of {totalPages}</span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-sm text-slate-400 transition hover:text-white disabled:opacity-30"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
