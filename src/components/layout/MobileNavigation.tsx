"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BrainCircuit, LogOut, Menu, X } from "lucide-react";
import {
  navItems,
  secondaryNavItems,
  mobileBottomNavItems,
  isNavActive,
} from "./navigation";

const drawerItems = [...navItems, ...secondaryNavItems];
const bottomHrefs = new Set(mobileBottomNavItems.map((item) => item.href));

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])';

export function MobileNavigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const moreBtnRef = useRef<HTMLButtonElement>(null);
  const hasOpenedRef = useRef(false);

  const isMoreActive = drawerItems.some(
    (item) => !bottomHrefs.has(item.href) && isNavActive(pathname, item.href)
  );

  // Keep the drawer mounted for the exit transition.
  useEffect(() => {
    if (open) {
      setMounted(true);
    } else {
      const t = setTimeout(() => setMounted(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Close when the route changes (navigation happens while it is open).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock background scrolling while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Move focus into the drawer when it opens and back to the trigger on close.
  useEffect(() => {
    if (open) {
      hasOpenedRef.current = true;
      closeBtnRef.current?.focus();
    } else if (hasOpenedRef.current) {
      moreBtnRef.current?.focus();
    }
  }, [open]);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  const trapFocus = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !drawerRef.current) return;
    const focusables = drawerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      {/* Bottom navigation bar (mobile only) */}
      <nav
        aria-label="Mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-[#ffffff0a] bg-[#050814]/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
      >
        <div className="flex items-stretch">
          {mobileBottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                aria-label={item.name}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-[60px] flex-1 flex-col items-center justify-center gap-1.5 py-2 transition-colors focus-visible:outline-none focus-visible:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-500/70 ${
                  active ? "text-purple-400" : "text-slate-400 hover:text-white"
                }`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                    active ? "bg-purple-500/15 ring-1 ring-inset ring-purple-500/30" : ""
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.2 : 2} />
                </span>
                <span
                  className={`max-w-full truncate px-1 text-[10px] font-medium leading-none ${
                    active ? "text-purple-300" : ""
                  }`}
                >
                  {item.name}
                </span>
                {active && (
                  <span className="absolute top-0 h-[3px] w-8 rounded-b-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                )}
              </Link>
            );
          })}
          <button
            ref={moreBtnRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open navigation menu"
            aria-expanded={open}
            aria-haspopup="dialog"
            className={`flex min-h-[60px] flex-1 flex-col items-center justify-center gap-1.5 py-2 transition-colors focus-visible:outline-none focus-visible:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-500/70 ${
              isMoreActive ? "text-purple-400" : "text-slate-400 hover:text-white"
            }`}
          >
            <span className="flex h-6 w-6 items-center justify-center">
              <Menu className="h-5 w-5" strokeWidth={isMoreActive ? 2.2 : 2} />
            </span>
            <span
              className={`max-w-full truncate px-1 text-[10px] font-medium leading-none ${
                isMoreActive ? "text-purple-300" : ""
              }`}
            >
              More
            </span>
          </button>
        </div>
      </nav>

      {/* Drawer backdrop (mobile only) */}
      {mounted && (
        <button
          type="button"
          tabIndex={-1}
          aria-label="Close navigation menu"
          onClick={() => setOpen(false)}
          className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />
      )}

      {/* Slide-out navigation drawer (mobile only) */}
      {mounted && (
        <div
          ref={drawerRef}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          onKeyDown={trapFocus}
          className={`fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col border-r border-[#ffffff0a] bg-[#050814] shadow-2xl shadow-black/60 transition-transform duration-300 ease-out md:hidden ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#ffffff0a] px-4 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-violet-600 text-white shadow-lg shadow-purple-900/20">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <span className="text-base font-bold text-white">InterviewAI</span>
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close navigation menu"
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/70"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Primary destinations */}
          <nav aria-label="Primary" className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/70 ${
                        active
                          ? "bg-purple-500/15 text-purple-400"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="flex-1 truncate">{item.name}</span>
                      {active && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="my-3 border-t border-[#ffffff0a]" />

            <ul className="flex flex-col gap-1">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/70 ${
                        active
                          ? "bg-purple-500/15 text-purple-400"
                          : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="flex-1 truncate">{item.name}</span>
                      {active && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Sign out */}
          <div className="border-t border-[#ffffff0a] p-3">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-slate-400 transition-colors hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/70"
            >
              <LogOut className="h-5 w-5 shrink-0" />
              <span className="flex-1 truncate text-left">Logout</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
