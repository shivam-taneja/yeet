import { Button } from "@/components/ui/button";
import { Construction, Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export function ActiveStateAction({
  isComingSoon,
  isTargetLoggedIn,
  active,
  onToggle,
}: {
  isComingSoon: boolean;
  isTargetLoggedIn: boolean;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      onClick={onToggle}
      disabled={!isTargetLoggedIn || isComingSoon}
      className={cn(
        "h-12 w-full rounded-full border-2 border-ink bg-coral text-base font-bold text-cream shadow-[4px_4px_0_var(--color-ink)] transition-transform",
        !isTargetLoggedIn || isComingSoon
          ? "opacity-40 cursor-not-allowed translate-y-1 shadow-[0px_0px_0_var(--color-ink)]"
          : "hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-ink)] active:translate-y-1 active:shadow-[0px_0px_0_var(--color-ink)]",
      )}
    >
      {isComingSoon ? (
        <Construction className="mr-2" />
      ) : active ? (
        <Pause className="mr-2" />
      ) : (
        <Play className="mr-2" />
      )}
      {isComingSoon ? "Coming Soon" : active ? "Pause Yeet" : "Start Yeeting"}
    </Button>
  );
}
