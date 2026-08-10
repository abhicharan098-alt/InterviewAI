"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { InterviewPauseModal } from "@/components/interviews/InterviewPauseModal";
import { useRouter } from "next/navigation";

interface Props {
  interviewId: string;
  interviewType: string;
  role: string;
  existingReminder?: { id: string; scheduledFor: Date } | null;
}

export function ReminderButton({ interviewId, interviewType, role, existingReminder }: Props) {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const handleSaved = () => {
    // Refresh the router to re-fetch the latest reminders from the server
    router.refresh();
  };

  const formatExistingTime = (d: Date) => {
    return new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault(); // Prevent Link navigation if somehow nested, though we restructured it
          setShowModal(true);
        }}
        className={`group flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
          existingReminder
            ? "bg-purple-500/15 text-purple-300 ring-1 ring-inset ring-purple-400/30 hover:bg-purple-500/25"
            : "bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white"
        }`}
        title={existingReminder ? "Reminder set" : "Set reminder"}
      >
        <Bell className={`h-4 w-4 ${existingReminder ? "text-purple-400 group-hover:scale-110 transition-transform" : ""}`} aria-hidden="true" />
        {existingReminder ? `Reminder ${formatExistingTime(existingReminder.scheduledFor)}` : "Remind Me"}
      </button>

      {showModal && (
        <InterviewPauseModal
          interviewId={interviewId}
          interviewType={interviewType}
          interviewRole={role}
          existingReminder={existingReminder}
          standalone={true}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
