export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; dot: string; cls: string }> = {
    COMPLETED: {
      label: "Completed",
      dot: "bg-emerald-400",
      cls: "bg-emerald-500/10 text-emerald-300 ring-emerald-400/25",
    },
    IN_PROGRESS: {
      label: "In Progress",
      dot: "bg-sky-400",
      cls: "bg-sky-500/10 text-sky-300 ring-sky-400/25",
    },
    ABANDONED: {
      label: "Abandoned",
      dot: "bg-slate-400",
      cls: "bg-slate-500/10 text-slate-400 ring-white/10",
    },
    DRAFT: {
      label: "Draft",
      dot: "bg-amber-400",
      cls: "bg-amber-500/10 text-amber-300 ring-amber-400/25",
    },
  };
  const item = map[status] ?? map.DRAFT;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${item.cls}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} aria-hidden="true" />
      {item.label}
    </span>
  );
}
