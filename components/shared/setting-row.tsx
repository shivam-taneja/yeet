import { cn } from "@/lib/utils";

interface SettingRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
  locked?: boolean;
  comingSoon?: boolean;
}

export function SettingRow({
  label,
  description,
  checked,
  onChange,
  locked = false,
  comingSoon = false,
}: SettingRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-4",
        locked && "opacity-50",
      )}
    >
      <div className="pr-6">
        <div className="flex items-center gap-2">
          <p className="font-bold text-base font-display">{label}</p>
          {comingSoon && (
            <span className="text-[9px] font-black uppercase tracking-widest bg-ink text-cream px-1.5 py-0.5 rounded-full">
              Soon
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-ink/60 mt-0.5">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={locked ? undefined : onChange}
        disabled={locked}
        className={cn(
          "relative inline-flex h-8 w-14 shrink-0 items-center justify-center rounded-full border-2 border-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2",
          locked ? "cursor-not-allowed" : "cursor-pointer",
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
    </div>
  );
}
