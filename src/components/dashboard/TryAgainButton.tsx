"use client";

import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";

/**
 * Re-runs the current server component render so dashboard data is re-fetched.
 */
export function TryAgainButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.refresh()}
      className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-5 text-sm font-semibold text-slate-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/70 active:bg-white/15"
    >
      <RotateCcw className="h-4 w-4" aria-hidden="true" />
      Try Again
    </button>
  );
}