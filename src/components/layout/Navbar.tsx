"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Menu,
  X,
  LogOut,
  User,
  FileText,
  LayoutDashboard,
  Sparkles,
  Activity,
  TrendingUp,
  Award,
  Settings,
  BrainCircuit,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

type NavItem = { name: string; href: string; icon: LucideIcon };

export function Navbar() {
  const { status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const authLinks: NavItem[] = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Resume", href: "/resume", icon: FileText },
    { name: "Practice", href: "/practice", icon: Sparkles },
    { name: "Interviews", href: "/interviews", icon: Activity },
    { name: "Progress", href: "/progress", icon: TrendingUp },
    { name: "Recommendations", href: "/recommendations", icon: Award },
    { name: "Profile", href: "/profile", icon: User },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const toggleMenu = () => setMobileMenuOpen((open) => !open);
  const closeMenu = () => setMobileMenuOpen(false);

  const desktopLinks: NavItem[] =
    status === "authenticated" ? authLinks.slice(0, 5) : [];
  const mobileLinks: NavItem[] =
    status === "authenticated"
      ? authLinks
      : [{ name: "Login", href: "/login", icon: User }];

  const handleSignOut = () => {
    closeMenu();
    signOut({ callbackUrl: "/login" });
  };

  const navLinkClasses = (active: boolean) =>
    `flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 ${
      active
        ? "bg-purple-500/10 text-purple-200"
        : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#050814]/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-5 lg:px-6">
        {/* Brand */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 rounded-lg font-bold tracking-tight text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70"
          aria-label="InterviewAI home"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-md shadow-purple-950/40">
            <BrainCircuit className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <span className="whitespace-nowrap text-[17px] leading-none">
            Interview<span className="text-gradient-purple">AI</span>
          </span>
        </Link>

        {status === "authenticated" ? (
          <>
            {/* Desktop navigation */}
            <div className="hidden min-w-0 items-center gap-0.5 md:flex">
              {desktopLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={navLinkClasses(isActive(link.href))}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                    {link.name}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={handleSignOut}
                className="ml-1 flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/60"
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                Logout
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                type="button"
                onClick={toggleMenu}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? "Close main menu" : "Open main menu"}
                className="inline-flex items-center justify-center rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/login"
                className="rounded-lg px-3.5 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70"
              >
                Register
              </Link>
            </div>
            <div className="flex items-center md:hidden">
              <button
                type="button"
                onClick={toggleMenu}
                aria-expanded={mobileMenuOpen}
                aria-label={mobileMenuOpen ? "Close main menu" : "Open main menu"}
                className="inline-flex items-center justify-center rounded-lg p-2 text-slate-300 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Mobile navigation */}
      {mobileMenuOpen && (
        <div className="border-t border-white/[0.08] bg-[#0B1220] md:hidden">
          <div className="max-h-[calc(100dvh-4rem)] overflow-y-auto px-3 py-3">
            <div className="flex flex-col gap-0.5">
              {mobileLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={closeMenu}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors ${
                      isActive(link.href)
                        ? "bg-purple-500/10 text-purple-200"
                        : "text-slate-300 hover:bg-white/[0.05] hover:text-white"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                    {link.name}
                  </Link>
                );
              })}

              {status === "authenticated" && (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-300"
                >
                  <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
