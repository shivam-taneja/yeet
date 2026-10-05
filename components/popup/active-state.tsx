import { useState, useEffect } from "react";
import { browser } from "wxt/browser";
import { useSettings } from "@/hooks/use-settings";
import { FALLBACK_SELECTORS, mergeSelectors } from "@/lib/constants";
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
  const [threadsToXEnabled, setThreadsToXEnabled] = useState(
    FALLBACK_SELECTORS.features.threadsToX !== false,
  );

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

  useEffect(() => {
    browser.storage.local.get(["selectors"]).then((res) => {
      const selectors = res.selectors
        ? mergeSelectors(res.selectors)
        : FALLBACK_SELECTORS;
      setThreadsToXEnabled(selectors.features.threadsToX !== false);
    });
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

  const isComingSoon =
    sourcePlatform === "Threads" && threadsToXEnabled === false;

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
