import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Target,
  FileText,
  Sparkles,
  Activity,
  TrendingUp,
  Bell,
  User,
  Settings,
} from "lucide-react";

export type NavItem = { name: string; href: string; icon: LucideIcon };

/**
 * Single source of truth for the InterviewAI navigation. The desktop sidebar,
 * the mobile bottom bar and the mobile "More" drawer all render from this
 * config so the routes, labels and icons can never drift apart.
 */
export const navItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Focus Areas", href: "/focus-areas", icon: Target },
  { name: "Resume", href: "/resume", icon: FileText },
  { name: "Practice", href: "/practice", icon: Sparkles },
  { name: "Interviews", href: "/interviews", icon: Activity },
  { name: "Progress", href: "/progress", icon: TrendingUp },
];

export const secondaryNavItems: NavItem[] = [
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

/** The primary destinations surfaced directly in the mobile bottom bar. */
export const mobileBottomNavItems: NavItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Resume", href: "/resume", icon: FileText },
  { name: "Practice", href: "/practice", icon: Sparkles },
  { name: "Interviews", href: "/interviews", icon: Activity },
  { name: "Progress", href: "/progress", icon: TrendingUp },
];

export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
