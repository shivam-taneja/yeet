import { ArrowRight, Construction } from "lucide-react";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { cn } from "@/lib/utils";

export function ActiveStateHero({
  sourcePlatform,
  targetPlatform,
  isComingSoon,
  active,
}: {
  sourcePlatform: "X" | "Threads";
  targetPlatform: "X" | "Threads";
  isComingSoon: boolean;
  active: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border-2 border-ink p-4 text-cream",
        isComingSoon ? "bg-ink/60" : "bg-grape",
      )}
    >
      <div className="flex items-center justify-center gap-3">
        <PlatformBadge name={sourcePlatform} />
        {isComingSoon ? (
          <div className="flex items-center gap-1 text-butter/70">
            <span className="h-px w-4 border-t-2 border-dashed border-butter/70" />
            <ArrowRight className="size-5 opacity-50" />
          </div>
        ) : (
          <div className="flex items-center gap-1 text-butter">
            <span className="h-0.5 w-5 bg-butter" />
            <ArrowRight className="size-5" />
          </div>
        )}
        <PlatformBadge name={targetPlatform} />
      </div>
      {isComingSoon ? (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          <Construction className="size-3.5 text-butter/70" />
          <p className="text-center text-xs font-bold text-butter/70 uppercase tracking-widest">
            Coming soon
          </p>
        </div>
      ) : (
        <p className="mt-3 text-center text-sm font-semibold">
          {active
            ? `Your next post will fly across to ${targetPlatform}.`
            : "Nothing moves while Yeet is paused."}
        </p>
      )}
    </div>
  );
}
