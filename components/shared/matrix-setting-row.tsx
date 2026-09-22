import { cn } from "@/lib/utils";

interface MatrixSettingRowProps {
  label: string;
  description: string;

  // Left toggle (X -> Threads)
  xChecked: boolean;
  onXChange: () => void;
  xLocked?: boolean;
  xComingSoon?: boolean;

  // Right toggle (Threads -> X)
  threadsChecked: boolean;
  onThreadsChange: () => void;
  threadsLocked?: boolean;
  threadsComingSoon?: boolean;
}

export function MatrixSettingRow({
  label,
  description,
  xChecked,
  onXChange,
  xLocked = false,
  xComingSoon = false,
  threadsChecked,
  onThreadsChange,
  threadsLocked = false,
  threadsComingSoon = false,
}: MatrixSettingRowProps) {
  const renderToggle = (
    checked: boolean,
    onChange: () => void,
    locked: boolean,
    soon: boolean,
  ) => (
    <div className="flex flex-col items-center gap-1 w-20">
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
      {soon && (
        <span className="text-[9px] font-black uppercase tracking-widest bg-ink text-cream px-1.5 py-0.5 rounded-full mt-1">
          Soon
        </span>
      )}
    </div>
  );

  return (
    <div className="flex items-center justify-between py-4 gap-4">
      <div className="flex-1 pr-4">
        <p className="font-bold text-base font-display">{label}</p>
        <p className="text-sm font-semibold text-ink/60 mt-0.5">
          {description}
        </p>
      </div>

      <div className="flex items-start gap-4 sm:gap-8 shrink-0">
        {renderToggle(xChecked, onXChange, xLocked, xComingSoon)}
        {renderToggle(
          threadsChecked,
          onThreadsChange,
          threadsLocked,
          threadsComingSoon,
        )}
      </div>
    </div>
  );
}
