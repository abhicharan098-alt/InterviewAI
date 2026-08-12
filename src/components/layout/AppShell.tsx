"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/ui/Sidebar";
import { TopBar } from "@/components/ui/TopBar";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import React from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";

  // Check if we are precisely on an active session path (e.g. /interview/uuid)
  // But NOT on the results page (e.g. /interview/uuid/result)
  const isInterview = pathname.startsWith("/interview/");
  const isFocus = pathname.startsWith("/focus-practice/");
  
  const pathParts = pathname.split("/").filter(Boolean); // e.g., ["interview", "uuid"]
  
  const isActiveInterview = isInterview && pathParts.length === 2 && pathParts[1] !== "result";
  const isActiveFocus = isFocus && pathParts.length === 2 && pathParts[1] !== "result";

  const isDistractionFree = isActiveInterview || isActiveFocus;

  if (isDistractionFree) {
    return (
      <div className="flex min-h-[100dvh] w-full flex-col overflow-hidden bg-[#050814]">
        <main className="flex-1 w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#050814]">
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-[72px]">
        <TopBar />
        <main className="flex-1 overflow-x-hidden p-4 pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-6 md:p-6 lg:pb-8 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>
      <MobileNavigation />
    </div>
  );
}
