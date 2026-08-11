"use client";

import { useEffect, useState } from "react";

function getGreeting(userName: string) {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return `Good morning, ${userName}`;
  if (hour >= 12 && hour < 17) return `Good afternoon, ${userName}`;
  if (hour >= 17 && hour < 21) return `Good evening, ${userName}`;
  return `Ready for a late-night practice, ${userName}?`;
}

export function DashboardGreeting({ userName }: { userName: string }) {
  const [greeting, setGreeting] = useState(() => getGreeting(userName));

  useEffect(() => {
    // Also update immediately on mount in case SSR was different from client time
    setGreeting(getGreeting(userName));
    
    const interval = setInterval(() => {
      setGreeting(getGreeting(userName));
    }, 60000);
    return () => clearInterval(interval);
  }, [userName]);

  return (
    <h1 suppressHydrationWarning className="text-2xl font-bold text-white">
      {greeting}
    </h1>
  );
}
