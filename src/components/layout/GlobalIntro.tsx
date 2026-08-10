"use client";

import { useState, useEffect, useRef } from "react";
import { IntroAnimation } from "@/components/intro/IntroAnimation";
import { useRouter } from "next/navigation";

export function GlobalIntro({ children }: { children: React.ReactNode }) {
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false);
  const router = useRouter();
  const destinationRef = useRef<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hasPlayedIntro && typeof window !== "undefined" && !destinationRef.current) {
      destinationRef.current = window.location.pathname + window.location.search;

      // Safety net: never stay stuck longer than 7s
      timeoutRef.current = setTimeout(() => {
        handleComplete();
      }, 7000);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPlayedIntro]);

  const handleComplete = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHasPlayedIntro(true);
    if (destinationRef.current) {
      router.replace(destinationRef.current);
    }
  };

  if (!hasPlayedIntro) {
    return (
      <>
        <div className="fixed inset-0 bg-[#050814] z-[9999]">
          <IntroAnimation onComplete={handleComplete} />
        </div>
        {/* Render children hidden to allow background data fetching without flashes */}
        <div className="opacity-0 pointer-events-none h-0 overflow-hidden">
          {children}
        </div>
      </>
    );
  }

  return <>{children}</>;
}

