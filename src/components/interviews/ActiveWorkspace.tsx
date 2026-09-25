"use client";

/**
 * Shared single-viewport shell for active timed writing workspaces
 * (Interview + Focus Practice).
 *
 * Mobile (< md):
 *  - Pins the workspace to exactly one viewport (`100dvh`) so the browser/page
 *    never vertically scrolls during a timed answering session.
 *  - Applies `env(safe-area-inset-*)` so controls stay clear of notches and
 *    the home indicator.
 *  - Only internal regions (question text, answer editor) own their scrolling.
 *
 * Desktop (>= md):
 *  - Behaves as a plain flex container. Height/overflow behavior is passed in
 *    via `desktopClassName` so each workspace keeps its existing layout
 *    untouched.
 *
 * Children should use the single-viewport flex model:
 *   header: flex: 0 0 auto (shrink-0)
 *   question: flex: 0 1 auto, min-height: 0, overflow-y: auto
 *   answer: flex: 1 1 auto, min-height: 0 (editor scrolls internally)
 *   actions: flex: 0 0 auto (shrink-0)
 */
export function ActiveWorkspace({
  children,
  desktopClassName = "md:h-auto md:overflow-visible md:pt-0 md:pb-0",
  className = "",
}: {
  children: React.ReactNode;
  desktopClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex h-[100dvh] w-full flex-col overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] ${desktopClassName} ${className}`}
    >
      {children}
    </div>
  );
}
