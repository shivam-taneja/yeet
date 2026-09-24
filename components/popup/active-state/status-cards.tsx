import {
  AlertCircle,
  Check,
  Clock3,
  Construction,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { YeetProgressStatus } from "@/types/settings";
import { formatDistanceToNow } from "date-fns";
import { browser } from "wxt/browser";
import type { AppSettings } from "@/types/settings";

interface StatusCardsProps {
  isComingSoon: boolean;
  isTargetLoggedIn: boolean;
  targetPlatform: "X" | "Threads";
  settings: AppSettings;
  now: number;
}

export function ActiveStateStatusCards({
  isComingSoon,
  isTargetLoggedIn,
  targetPlatform,
  settings,
  now,
}: StatusCardsProps) {
  if (isComingSoon) {
    return (
      <div className="my-5 flex items-start gap-3 rounded-2xl border-2 border-dashed border-ink/30 bg-ink/5 p-4 text-ink/60">
        <Construction className="size-5 shrink-0 mt-0.5" />
        <div className="min-w-0 w-full">
          <p className="text-sm font-bold text-ink/70">
            Threads → X is coming soon
          </p>
          <p className="mt-1 text-xs font-semibold">
            We're working on it. X → Threads works great in the meantime!
          </p>
          <Button
            variant="outline"
            className="mt-3 h-12 w-full justify-start gap-3 rounded-xl border-2 border-ink bg-cream font-bold hover:bg-ink/5 shadow-[2px_2px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--color-ink)] active:translate-y-1 active:shadow-none"
            onClick={() => browser.tabs.create({ url: "https://x.com" })}
          >
            <PlatformBadge name="X" />
            <span className="font-bold text-base">Open X to Yeet</span>
          </Button>
        </div>
      </div>
    );
  }

  if (!isTargetLoggedIn) {
    return (
      <div className="my-5 flex items-start gap-3 rounded-2xl border-2 border-ink border-dashed bg-coral/10 p-4 text-ink">
        <AlertCircle className="size-5 shrink-0 text-coral" />
        <div className="min-w-0 w-full">
          <p className="text-sm font-bold">Authentication Required</p>
          <p className="mt-1 text-xs font-semibold text-ink/70">
            Please log in to {targetPlatform} before you can yeet.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full rounded-xl border-2 border-ink bg-white font-bold transition-transform hover:-translate-y-0.5 shadow-[2px_2px_0_var(--color-ink)] hover:bg-ink/5"
            onClick={() => {
              browser.tabs.create({
                url:
                  targetPlatform === "X"
                    ? "https://x.com"
                    : "https://threads.com",
              });
            }}
          >
            Log in to {targetPlatform}
          </Button>
        </div>
      </div>
    );
  }

  if (settings.yeetProgress?.status === YeetProgressStatus.YEETING) {
    return (
      <div className="my-5 overflow-hidden rounded-2xl border-2 border-ink bg-cream shadow-[4px_4px_0_var(--color-ink)] relative">
        <div className="absolute inset-0 bg-grape/10 animate-pulse" />
        <div className="flex items-center gap-3 p-4 relative z-10">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-butter border-2 border-ink shadow-[2px_2px_0_var(--color-ink)]">
            <Loader2 className="size-5 text-ink animate-spin" />
          </span>
          <div className="min-w-0 w-full mt-0.5">
            <p className="text-sm font-bold text-ink">
              Yeeting to {targetPlatform}...
            </p>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full border border-ink bg-ink/10">
              <div className="h-full w-full origin-left animate-pulse bg-grape transition-all duration-500 ease-in-out" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (settings.lastYeet) {
    return (
      <div className="my-5 flex items-start gap-3 rounded-2xl border-2 border-ink bg-background p-4">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mint border-2 border-ink shadow-[2px_2px_0_var(--color-ink)]">
          <Check className="size-5 text-ink" />
        </span>
        <div className="min-w-0 w-full">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink">
                Last yeet landed on {settings.lastYeet.platform}
              </p>
              <p className="mt-1 truncate text-xs font-semibold text-ink/70">
                "{settings.lastYeet.text}"
              </p>
            </div>
            {settings.lastYeet.postUrl && (
              <Button
                variant="outline"
                size="icon"
                className="size-8 shrink-0 rounded-xl border-2 border-ink bg-white shadow-[2px_2px_0_var(--color-ink)] hover:bg-ink/5 hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all"
                onClick={() =>
                  browser.tabs.create({ url: settings.lastYeet!.postUrl })
                }
                title="View Post"
              >
                <ExternalLink className="size-4 text-ink" />
              </Button>
            )}
          </div>
          <p className="mt-2 flex items-center gap-1 text-[11px] font-bold text-ink/45">
            <Clock3 className="size-3" />
            {now - settings.lastYeet.timestamp < 10000
              ? "just now"
              : formatDistanceToNow(settings.lastYeet.timestamp, {
                  addSuffix: true,
                })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="my-5 flex items-center gap-3 rounded-2xl border-2 border-ink border-dashed bg-ink/5 p-4 text-ink/50">
      <AlertCircle className="size-5 shrink-0" />
      <p className="text-sm font-semibold">No yeets sent yet.</p>
    </div>
  );
}
