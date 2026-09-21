export function StatusPill({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-3 py-1 text-xs font-bold ${
        active ? "bg-mint" : "bg-butter"
      }`}
    >
      <span
        className={`size-2 rounded-full ${active ? "bg-ink" : "bg-coral"}`}
      />
      {active ? "Yeeting" : "Paused"}
    </span>
  );
}
