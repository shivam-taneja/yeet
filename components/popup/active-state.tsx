import { ArrowRight, Check, Clock3, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { StatusPill } from "@/components/shared/status-pill";

export interface ActiveStateProps {
  active: boolean;
  sourcePlatform: "X" | "Threads";
  onToggle: () => void;
}

export function ActiveState({
  active,
  sourcePlatform,
  onToggle,
}: ActiveStateProps) {
  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <StatusPill active={active} />
        <span className="text-xs font-semibold text-ink/50">
          2 accounts linked
        </span>
      </div>

      <div className="rounded-2xl border-2 border-ink bg-grape p-4 text-cream">
        <div className="flex items-center justify-center gap-3">
          <PlatformBadge name={sourcePlatform} />
          <div className="flex items-center gap-1 text-butter">
            <span className="h-0.5 w-5 bg-butter" />
            <ArrowRight className="size-5" />
          </div>
          <PlatformBadge name={sourcePlatform === "X" ? "Threads" : "X"} />
        </div>
        <p className="mt-3 text-center text-sm font-semibold">
          {active
            ? `Your next post will fly across to ${
                sourcePlatform === "X" ? "Threads" : "X"
              }.`
            : "Nothing moves while Yeet is paused."}
        </p>
      </div>

      <div className="my-5 flex items-start gap-3 rounded-2xl border-2 border-ink bg-background p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mint">
          <Check className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-bold">Last yeet landed</p>
          <p className="mt-1 truncate text-xs text-ink/55">
            “Small wins deserve a little noise.”
          </p>
          <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-ink/45">
            <Clock3 className="size-3" /> 18 seconds ago
          </p>
        </div>
      </div>

      <Button
        onClick={onToggle}
        className="h-12 w-full rounded-full border-2 border-ink bg-coral text-base font-bold text-cream shadow-[4px_4px_0_var(--color-ink)] hover:bg-coral/90"
      >
        {active ? <Pause className="mr-2" /> : <Play className="mr-2" />}
        {active ? "Pause Yeet" : "Start Yeeting"}
      </Button>
    </>
  );
}
