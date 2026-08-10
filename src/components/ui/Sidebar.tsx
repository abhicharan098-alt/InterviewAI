"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  Activity,
  TrendingUp,
  User,
  Settings,
  LogOut,
  BrainCircuit,
  Target,
  Bell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NavItem = { name: string; href: string; icon: LucideIcon };

const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Focus Areas", href: "/focus-areas", icon: Target },
  { name: "Resume", href: "/resume", icon: FileText },
  { name: "Practice", href: "/practice", icon: Sparkles },
  { name: "Interviews", href: "/interviews", icon: Activity },
  { name: "Progress", href: "/progress", icon: TrendingUp },
];

const bottomNavItems: NavItem[] = [
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar({ collapsed = true }: { collapsed?: boolean }) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-[72px] flex-col items-center border-r border-[#ffffff0a] bg-[#050814]/80 pb-6 pt-6 backdrop-blur-xl transition-all md:flex">
      {/* Brand Icon */}
      <Link href="/dashboard" className="mb-8 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-900/20 transition-transform hover:scale-105">
        <BrainCircuit className="h-5 w-5" />
      </Link>

      {/* Main Nav */}
      <nav className="flex w-full flex-col items-center gap-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
                active
                  ? "bg-purple-500/15 text-purple-400"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
              title={item.name}
            >
              <Icon className="h-5 w-5" />
              {active && (
                <span className="absolute -right-[1px] top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Nav */}
      <div className="mt-auto flex w-full flex-col items-center gap-4">
        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all ${
                active
                  ? "bg-purple-500/15 text-purple-400"
                  : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
              }`}
              title={item.name}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
        <button
          onClick={handleSignOut}
          className="flex h-12 w-12 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-400"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </aside>
  );
}
