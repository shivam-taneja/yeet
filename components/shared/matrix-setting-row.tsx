import { cn } from "@/lib/utils";

/** Shared column layout for cross-posting rules table + header row. */
export const matrixRulesGridClass =
  "grid grid-cols-[minmax(0,1fr)_4.25rem_4.25rem] gap-x-3 sm:grid-cols-[minmax(0,1fr)_5.5rem_5.5rem] sm:gap-x-8";

interface MatrixSettingRowProps {
  label: string;
  description: string;

  xChecked: boolean;
  onXChange: () => void;
  xLocked?: boolean;
  xUnavailable?: boolean;
  xComingSoon?: boolean;

  threadsChecked: boolean;
  onThreadsChange: () => void;
  threadsLocked?: boolean;
  threadsUnavailable?: boolean;
  threadsComingSoon?: boolean;
}

function ComingSoonBadge() {
  return (
    <span className="text-[9px] font-black uppercase tracking-widest bg-ink text-cream px-1.5 py-0.5 rounded-full mt-1">
      Soon
    </span>
  );
}

function MatrixToggle({
  checked,
  onChange,
  locked,
  unavailable,
  comingSoon,
}: {
  checked: boolean;
  onChange: () => void;
  locked?: boolean;
  unavailable?: boolean;
  comingSoon?: boolean;
}) {
  if (unavailable) {
    return (
      <div className="flex w-17 sm:w-20 shrink-0 items-center justify-center">
        <span className="text-sm font-bold text-ink/35">—</span>
      </div>
    );
  }

  return (
    <div className="flex w-17 sm:w-20 shrink-0 flex-col items-center justify-center">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={locked ? undefined : onChange}
        disabled={locked}
        className={cn(
          "relative inline-flex h-8 w-14 shrink-0 items-center justify-center rounded-full border-2 border-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2",
          locked ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          checked ? "bg-mint" : "bg-ink/10",
        )}
      >
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-cream border-2 border-ink shadow-[2px_2px_0_var(--color-ink)] transition-transform",
            checked ? "translate-x-2" : "-translate-x-2",
          )}
        />
      </button>
      {comingSoon && <ComingSoonBadge />}
    </div>
  );
}

export function MatrixSettingRow({
  label,
  description,
  xChecked,
  onXChange,
  xLocked = false,
  xUnavailable = false,
  xComingSoon = false,
  threadsChecked,
  onThreadsChange,
  threadsLocked = false,
  threadsUnavailable = false,
  threadsComingSoon = false,
}: MatrixSettingRowProps) {
  return (
    <div className={cn(matrixRulesGridClass, "items-start gap-y-1 py-4")}>
      <div className="min-w-0 pr-2">
        <p className="font-bold text-base font-display">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-ink/60">
          {description}
        </p>
      </div>

      <MatrixToggle
        checked={xChecked}
        onChange={onXChange}
        locked={xLocked}
        unavailable={xUnavailable}
        comingSoon={xComingSoon}
      />
      <MatrixToggle
        checked={threadsChecked}
        onChange={onThreadsChange}
        locked={threadsLocked}
        unavailable={threadsUnavailable}
        comingSoon={threadsComingSoon}
      />
    </div>
  );
}
