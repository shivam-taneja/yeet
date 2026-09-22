import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { browser } from "wxt/browser";
import { useSettings } from "@/hooks/use-settings";

export function Footer() {
  const { settings } = useSettings();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(interval);
  }, []);

  const getRelativeTime = () => {
    if (!settings.lastSavedAt) return null;
    const diff = now - settings.lastSavedAt;
    if (diff < 10000) return "just now";
    return formatDistanceToNow(settings.lastSavedAt, { addSuffix: true });
  };

  return (
    <div className="text-center mt-10 text-xs font-semibold text-ink/40 flex flex-col items-center gap-1 md:col-span-2">
      <p>
        Changes are saved automatically. You can close this tab at any time.
      </p>
      {settings.lastSavedAt && (
        <p className="text-ink/60">Updated {getRelativeTime()}.</p>
      )}
      <p className="mt-2 font-bold">v{browser.runtime.getManifest().version}</p>
    </div>
  );
}
