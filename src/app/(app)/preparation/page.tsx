"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Target, AlertCircle, CheckCircle2, TrendingUp, Sparkles, BookOpen, ArrowRight, User } from "lucide-react";
import Link from "next/link";

// Inline simple Badge component to replace @/components/ui/badge
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className || ""}`}>{children}</span>;
}

export default function PreparationPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/login";
      return;
    }

    if (status === "authenticated") {
      fetch("/api/preparation")
        .then((res) => res.json())
        .then((json) => {
          setData(json);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setIsLoading(false);
        });
    }
  }, [status]);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p>Analyzing profile and performance data...</p>
        </div>
      </div>
    );
  }

  if (!data?.profile?.targetRole) {
    return (
      <div className="max-w-4xl mx-auto p-8 pt-12">
        <div className="bg-gray-900 border border-gray-800 p-12 rounded-3xl text-center shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-32 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />
          <User className="w-16 h-16 text-purple-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Set Your Target Role</h1>
          <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
            To generate your personalized preparation plan, we need to know what role you are targeting.
          </p>
          <Link
            href="/profile"
            className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full font-medium transition-colors"
          >
            Update Profile
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  const { readiness, profile, skillGap } = data;

  return (
    <div className="max-w-6xl mx-auto p-8 pt-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Preparation Plan</h1>
        <p className="text-gray-400 text-lg">
          Personalized analysis for <span className="text-purple-400 font-semibold">{profile.targetRole}</span>
          {profile.targetCompany && ` at ${profile.targetCompany}`}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Readiness Score Card */}
        <div className="col-span-1 lg:col-span-1 bg-gray-900/50 border border-gray-800 rounded-3xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-emerald-500" />
          <div className="w-48 h-48 rounded-full border-8 border-gray-800 flex items-center justify-center mb-6 relative">
            <svg className="absolute inset-0 w-full h-full transform -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="46%"
                className="stroke-gray-800 fill-none stroke-[8]"
              />
              <circle
                cx="50%"
                cy="50%"
                r="46%"
                className="stroke-purple-500 fill-none stroke-[8] transition-all duration-1000 ease-out"
                strokeDasharray="289"
                strokeDashoffset={289 - (289 * readiness.score) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="text-center z-10">
              <span className="text-5xl font-bold text-white">{readiness.score}</span>
              <span className="text-gray-500 block text-sm mt-1">/ 100</span>
            </div>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{readiness.label}</h2>
          <p className="text-gray-400 text-sm">
            Based on {readiness.interviewCount} recent interviews
          </p>
        </div>

        {/* Skill Gap Analysis (AI) */}
        <div className="col-span-1 lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Skill Analysis</h2>
            {skillGap?.roleAlignment && (
              <Badge className="ml-auto bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                {skillGap.roleAlignment}% Resume Match
              </Badge>
            )}
          </div>

          {skillGap ? (
            <div className="space-y-6">
              <p className="text-gray-300 bg-gray-800/50 p-4 rounded-xl border border-gray-700/50">
                {skillGap.summary}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Strengths
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skillGap.strengths.map((s: string, i: number) => (
                      <Badge key={i} className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 hover:bg-emerald-500/20">{s}</Badge>
                    ))}
                    {skillGap.strengths.length === 0 && <span className="text-gray-500 text-sm">No specific strengths identified.</span>}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-rose-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Priority Gaps
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {skillGap.priorityAreas.map((g: string, i: number) => (
                      <Badge key={i} className="bg-rose-500/10 text-rose-300 border-rose-500/20 hover:bg-rose-500/20">{g}</Badge>
                    ))}
                    {skillGap.priorityAreas.length === 0 && <span className="text-gray-500 text-sm">No major gaps identified.</span>}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 border border-dashed border-gray-700 rounded-xl">
              <p className="text-gray-400">Upload your resume and complete a practice interview to unlock AI skill analysis.</p>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-2xl font-bold text-white mb-6">Recommended Action Plan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {readiness.recommendations.map((rec: any, idx: number) => (
          <div key={idx} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-all flex flex-col">
            <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center mb-4">
              {idx === 0 ? <Target className="w-6 h-6" /> : idx === 1 ? <TrendingUp className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
            </div>
            <h3 className="text-lg font-bold text-white mb-2">{rec.title}</h3>
            <p className="text-gray-400 text-sm flex-grow mb-6">{rec.description}</p>
            <Link
              href={rec.href}
              className="inline-flex items-center justify-center w-full gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-colors"
            >
              {rec.action}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
