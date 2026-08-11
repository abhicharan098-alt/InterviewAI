"use client";

import { User } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export function TopBar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const getPageContext = () => {
    // Exact routes
    if (pathname === "/dashboard") return { title: "Dashboard", desc: "Overview of your interview preparation" };
    if (pathname === "/focus-areas") return { title: "Build Your Strengths", desc: "Choose the skills you want to practice and improve through personalized coaching." };
    if (pathname === "/practice") return { title: "Practice & Prepare", desc: "Configure a focused interview session tailored to your goals." };
    if (pathname === "/interviews") return { title: "Interview History", desc: "Review your previous interview sessions, scores, and progress." };
    if (pathname === "/progress") return { title: "Your Progress", desc: "Track your performance and see how your interview skills are improving." };
    if (pathname === "/coach") return { title: "AI Coach", desc: "Get personalized guidance based on your interview performance." };
    if (pathname === "/notifications") return { title: "Notifications", desc: "Stay updated with interview tips, practice reminders, results, and achievements." };
    if (pathname === "/profile") return { title: "Your Profile", desc: "Manage your personal information and interview preferences." };
    if (pathname === "/settings") return { title: "Settings", desc: "Customize your InterviewAI experience and account preferences." };
    if (pathname === "/resume") return { title: "Resume", desc: "Manage your resume and use it to personalize your interview preparation." };
    if (pathname === "/recommendations") return { title: "Recommendations", desc: "Targeted suggestions to accelerate your interview readiness." };
    if (pathname === "/preparation") return { title: "Preparation Guide", desc: "Comprehensive guidance for your target roles." };

    // Dynamic routes
    if (pathname.match(/^\/interview\/[^\/]+\/result$/)) return { title: "Interview Results", desc: "Review your performance, strengths, and opportunities to improve." };
    if (pathname.startsWith("/interview/")) return { title: "Interview Session", desc: "Complete your interview and demonstrate your skills." };
    if (pathname.match(/^\/focus-practice\/result\/[^\/]+$/)) return { title: "Practice Results", desc: "Review your focus practice performance and insights." };
    if (pathname.startsWith("/focus-practice/")) return { title: "Focused Practice", desc: "Strengthen the specific skills that need the most improvement." };

    // Fallback
    return { title: "Interview Platform", desc: "Prepare, practice, and succeed." };
  };

  const { title, desc } = getPageContext();

  return (
    <header className="sticky top-0 z-30 flex min-h-[4rem] py-3 w-full items-center justify-between gap-4 border-b border-[#ffffff0a] bg-[#050814]/70 px-4 md:px-6 backdrop-blur-md">
      <div className="flex flex-col flex-1 min-w-0 pr-2">
        <h1 className="text-[15px] font-semibold text-slate-100 break-words">{title}</h1>
        <p className="text-[11px] text-slate-400 mt-0.5 leading-snug text-balance">{desc}</p>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <NotificationBell />

        <div className="flex items-center gap-3 rounded-full border border-white/[0.05] bg-white/[0.02] py-1 pl-1 pr-3 transition-colors hover:bg-white/[0.04]">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-600/20 text-purple-300 shrink-0">
            {session?.user?.image ? (
              <img src={session.user.image} alt="User" referrerPolicy="no-referrer" className="h-full w-full rounded-full object-cover" />
            ) : (
              <User className="h-4 w-4" />
            )}
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-[12px] font-medium leading-none text-slate-200">
              {session?.user?.name || "Candidate"}
            </span>
            <span className="text-[10px] text-purple-400 mt-0.5 flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span> Online
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

