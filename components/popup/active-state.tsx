import {
  ArrowRight,
  Check,
  Clock3,
  Pause,
  Play,
  AlertCircle,
  Construction,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { StatusPill } from "@/components/shared/status-pill";
import { useSettings } from "@/hooks/use-settings";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { browser } from "wxt/browser";
import { cn } from "@/lib/utils";

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
  const { settings } = useSettings();
  const [now, setNow] = useState(Date.now());
  const [authStatus, setAuthStatus] = useState<{
    x: boolean;
    threads: boolean;
  } | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkLinkedAccounts = async () => {
      try {
        if (browser.cookies) {
          const xCookies = await browser.cookies.getAll({ name: "auth_token" });
          const xLinked = xCookies.some((c) => c.domain.includes("x.com"));

          const threadsCookies = await browser.cookies.getAll({
            name: "sessionid",
          });
          const threadsLinked = threadsCookies.some(
            (c) =>
              c.domain.includes("threads.com") ||
              c.domain.includes("instagram.com"),
          );

          setAuthStatus({ x: xLinked, threads: threadsLinked });
        }
      } catch (e) {
        console.error("Failed to check cookies:", e);
      }
    };
    checkLinkedAccounts();
  }, []);

  const linkedAccounts = authStatus
    ? (authStatus.x ? 1 : 0) + (authStatus.threads ? 1 : 0)
    : 0;

  const targetPlatform = sourcePlatform === "X" ? "Threads" : "X";
  const isTargetLoggedIn = authStatus
    ? sourcePlatform === "X"
      ? authStatus.threads
      : authStatus.x
    : true;

  // Threads → X is not yet supported
  const isComingSoon = sourcePlatform === "Threads";

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <StatusPill active={active} />
        <span className="text-xs font-semibold text-ink/50">
          {linkedAccounts} account{linkedAccounts !== 1 ? "s" : ""} linked
        </span>
      </div>

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

      {isComingSoon ? (
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
      ) : !isTargetLoggedIn ? (
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
      ) : settings.lastYeet ? (
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
      ) : (
        <div className="my-5 flex items-center gap-3 rounded-2xl border-2 border-ink border-dashed bg-ink/5 p-4 text-ink/50">
          <AlertCircle className="size-5 shrink-0" />
          <p className="text-sm font-semibold">No yeets sent yet.</p>
        </div>
      )}

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
    </>
  );
}
