"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LogOut,
  BrainCircuit,
} from "lucide-react";
import {
  navItems,
  secondaryNavItems as bottomNavItems,
  isNavActive,
} from "@/components/layout/navigation";

export function Sidebar({ collapsed = true }: { collapsed?: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string) => isNavActive(pathname, href);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <aside className="group/sidebar fixed left-0 top-0 z-40 hidden h-screen w-[72px] flex-col border-r border-[#ffffff0a] bg-[#050814]/80 pb-6 pt-6 backdrop-blur-xl transition-all duration-300 ease-out hover:w-[240px] hover:bg-[#050814]/95 hover:shadow-2xl md:flex overflow-hidden">
      {/* Brand Icon */}
      <div className="flex w-full px-3 mb-8">
        <Link href="/dashboard" className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-900/20 transition-transform hover:scale-105 shrink-0">
          <BrainCircuit className="h-5 w-5" />
        </Link>
        <span className="ml-3 flex items-center whitespace-nowrap text-lg font-bold text-white opacity-0 -translate-x-2 transition-all duration-300 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0">
          InterviewAI
        </span>
      </div>

      {/* Main Nav */}
      <nav className="flex w-full flex-col gap-2 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative flex h-12 w-full items-center rounded-xl transition-all duration-300 ${
                active
                  ? "bg-purple-500/15 text-purple-400"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <div className="flex h-full min-w-[48px] items-center justify-center shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <span className="whitespace-nowrap font-medium opacity-0 -translate-x-2 transition-all duration-300 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0">
                {item.name}
              </span>
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="mt-auto flex w-full flex-col gap-2 px-3">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative flex h-12 w-full items-center rounded-xl transition-all duration-300 ${
                active
                  ? "bg-purple-500/15 text-purple-400"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
            >
              <div className="flex h-full min-w-[48px] items-center justify-center shrink-0">
                <Icon className="h-5 w-5" />
              </div>
              <span className="whitespace-nowrap font-medium opacity-0 -translate-x-2 transition-all duration-300 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0">
                {item.name}
              </span>
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
              )}
            </Link>
          );
        })}
        <button
          onClick={handleSignOut}
          className="group relative flex h-12 w-full items-center rounded-xl text-slate-400 transition-all duration-300 hover:bg-red-500/10 hover:text-red-400"
        >
          <div className="flex h-full min-w-[48px] items-center justify-center shrink-0">
            <LogOut className="h-5 w-5" />
          </div>
          <span className="whitespace-nowrap font-medium opacity-0 -translate-x-2 transition-all duration-300 group-hover/sidebar:opacity-100 group-hover/sidebar:translate-x-0">
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}
