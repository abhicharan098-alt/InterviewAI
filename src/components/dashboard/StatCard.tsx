"use client";

import { useEffect, useRef, useState } from "react";
import { Activity, Target, CircleHelp, TrendingUp } from "lucide-react";

const ICONS = {
  activity: Activity,
  target: Target,
  circleHelp: CircleHelp,
  trendingUp: TrendingUp,
} as const;

export type StatIcon = keyof typeof ICONS;

/**
 * Compact dashboard statistic card.
 * Numeric values count up from 0 when the card enters the viewport.
 * A null value renders a graceful "—" placeholder.
 *
 * `icon` is a string key (not a component reference) so this Client
 * Component can be safely rendered from a Server Component.
 */
export function StatCard({
  label,
  value,
  suffix = "",
  icon,
}: {
  label: string;
  value: number | null;
  suffix?: string;
  icon: StatIcon;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(0);

  const hasValue = value !== null && value !== undefined;
  const Icon = ICONS[icon];

  useEffect(() => {
    const el = ref.current;
    if (!el || !hasValue) return;

    if (typeof IntersectionObserver === "undefined") {
      setDisplay(value);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            observer.disconnect();
            const target = value;
            const duration = 700;
            const start = performance.now();

            const tick = (now: number) => {
              const t = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - t, 3);
              setDisplay(Math.round(target * eased));
              if (t < 1) requestAnimationFrame(tick);
            };

            requestAnimationFrame(tick);
          }
        });
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasValue, value]);

  return (
    <div
      ref={ref}
      className="flex h-full flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0D1424] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-purple-500/30"
    >
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold tracking-wider text-slate-400 uppercase">{label}</p>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.03] text-purple-400">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-4xl font-bold text-white tabular-nums">
          {hasValue ? (
            <>
              {display}<span className="text-2xl text-purple-400">{suffix}</span>
            </>
          ) : (
            <span className="text-slate-500">—</span>
          )}
        </p>
      </div>
    </div>
  );
}