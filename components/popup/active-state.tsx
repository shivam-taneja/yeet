import { useState, useEffect } from "react";
import { browser } from "wxt/browser";
import { useSettings } from "@/hooks/use-settings";
import { ActiveStateHeader } from "./active-state/header";
import { ActiveStateHero } from "./active-state/hero";
import { ActiveStateStatusCards } from "./active-state/status-cards";
import { ActiveStateAction } from "./active-state/action-button";

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
      <ActiveStateHeader active={active} linkedAccounts={linkedAccounts} />

      <ActiveStateHero
        sourcePlatform={sourcePlatform}
        targetPlatform={targetPlatform}
        isComingSoon={isComingSoon}
        active={active}
      />

      <ActiveStateStatusCards
        isComingSoon={isComingSoon}
        isTargetLoggedIn={isTargetLoggedIn}
        targetPlatform={targetPlatform}
        settings={settings}
        now={now}
      />

      <ActiveStateAction
        isComingSoon={isComingSoon}
        isTargetLoggedIn={isTargetLoggedIn}
        active={active}
        onToggle={onToggle}
      />
    </>
  );
}
