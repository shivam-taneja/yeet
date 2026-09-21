import {
  ArrowRight,
  Check,
  Clock3,
  Pause,
  Play,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformBadge } from "@/components/shared/platform-badge";
import { StatusPill } from "@/components/shared/status-pill";
import { useSettings } from "@/hooks/use-settings";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";
import { browser } from "wxt/browser";

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
  const [linkedAccounts, setLinkedAccounts] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkLinkedAccounts = async () => {
      let count = 0;
      try {
        if (browser.cookies) {
          const xCookie = await browser.cookies.get({
            url: "https://x.com",
            name: "auth_token",
          });
          if (xCookie) count++;

          const threadsCookie = await browser.cookies.get({
            url: "https://www.threads.net",
            name: "sessionid",
          });
          if (threadsCookie) count++;
        }
      } catch (e) {
        console.error("Failed to check cookies:", e);
      }
      setLinkedAccounts(count);
    };
    checkLinkedAccounts();
  }, []);

  return (
    <>
      <div className="mb-5 flex items-center justify-between">
        <StatusPill active={active} />
        <span className="text-xs font-semibold text-ink/50">
          {linkedAccounts} account{linkedAccounts !== 1 ? "s" : ""} linked
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

      {settings.lastYeet ? (
        <div className="my-5 flex items-start gap-3 rounded-2xl border-2 border-ink bg-background p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mint border-2 border-ink shadow-[2px_2px_0_var(--color-ink)]">
            <Check className="size-5 text-ink" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink">Last yeet landed</p>
            <p className="mt-1 truncate text-xs font-semibold text-ink/70">
              "{settings.lastYeet.text}"
            </p>
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
        className="h-12 w-full rounded-full border-2 border-ink bg-coral text-base font-bold text-cream shadow-[4px_4px_0_var(--color-ink)] hover:bg-coral/90"
      >
        {active ? <Pause className="mr-2" /> : <Play className="mr-2" />}
        {active ? "Pause Yeet" : "Start Yeeting"}
      </Button>
    </>
  );
}
