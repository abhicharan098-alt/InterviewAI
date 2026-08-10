"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Save, Building, Briefcase, MapPin, AlignLeft, CheckCircle2, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const { status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    targetRole: "",
    targetCompany: "",
    location: "",
    bio: "",
  });

  const router = useRouter();
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    } else if (status === "authenticated") {
      fetch("/api/profile")
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            name: data.name || "",
            targetRole: data.targetRole || "",
            targetCompany: data.targetCompany || "",
            location: data.location || "",
            bio: data.bio || "",
          });
          setLoading(false);
        })
        .catch(console.error);
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return; // Prevent double submission
    setSaving(true);
    setError("");
    setSaved(false);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      } else {
        console.error("[PROFILE] Save failed with status:", res.status);
        setError("Failed to update profile. Please try again.");
        setSaving(false);
      }
    } catch (err) {
      console.error("[PROFILE] Network error:", err);
      setError("Failed to update profile. Please try again.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center min-h-[50vh] items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="relative mx-auto w-full">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="mb-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-purple-300/90">
              InterviewAI · Profile
            </p>
            <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
            <p className="text-slate-400">Manage your personal information and target goals.</p>
          </div>
          <div className="w-16 h-16 bg-purple-500/10 border border-white/[0.06] text-purple-400 rounded-2xl flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0D1424] border border-white/[0.08] rounded-2xl p-8 shadow-xl space-y-8">
          
          {/* Personal Info */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 pb-4 border-b border-white/[0.04]">Personal Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" /> Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-slate-500"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-500" /> Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-slate-500"
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>
          </div>

          {/* Target Goals */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4 pb-4 border-b border-white/[0.04]">Target Goals</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-500" /> Target Role
                </label>
                <input
                  type="text"
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-slate-500"
                  placeholder="e.g. Senior Frontend Engineer"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-500" /> Target Company (Optional)
                </label>
                <input
                  type="text"
                  value={formData.targetCompany}
                  onChange={(e) => setFormData({ ...formData, targetCompany: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder-slate-500"
                  placeholder="e.g. Google, Stripe"
                />
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-slate-500" /> Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full h-32 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none placeholder-slate-500"
              placeholder="Tell us a bit about your background..."
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/[0.04]">
            {error && (
              <span className="text-red-400 flex items-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4" /> {error}
              </span>
            )}
            {saved && (
              <span className="text-emerald-400 flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4" /> Profile updated successfully
              </span>
            )}
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:brightness-110 text-white rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-purple-950/40"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
