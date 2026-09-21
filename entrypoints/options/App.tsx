import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { browser } from "wxt/browser";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";
import logoUrl from "@/assets/logo.png";

export default function App() {
  const { settings, updateSettings, isLoading } = useSettings();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggle = () => {
    updateSettings({ copyImages: !settings.copyImages });
  };

  const getRelativeTime = () => {
    if (!settings.lastSavedAt) return null;
    const diff = now - settings.lastSavedAt;
    if (diff < 10000) return "just now";
    return formatDistanceToNow(settings.lastSavedAt, { addSuffix: true });
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-cream font-body text-ink flex flex-col items-center py-12 px-4 selection:bg-mint/30">
      <div className="w-full max-w-lg">
        <div className="flex flex-col items-center mb-10">
          <button
            onClick={() =>
              browser.tabs.create({ url: "https://yeet.shivamtaneja.com/" })
            }
            className="cursor-pointer transition-transform hover:-translate-y-1 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 rounded-xl mb-6"
            aria-label="Visit Yeet website"
          >
            <img
              src={logoUrl}
              alt="Yeet"
              className="h-16 w-auto drop-shadow-[4px_4px_0_var(--color-ink)]"
            />
          </button>
          <h1 className="text-3xl font-black font-display tracking-tight text-ink">
            Settings
          </h1>
          <p className="text-ink/60 font-semibold mt-2 text-center max-w-70">
            Configure your cross-posting preferences and rules.
          </p>
        </div>

        <div className="w-full overflow-hidden rounded-[24px] border-2 border-ink bg-white shadow-[8px_8px_0_var(--color-ink)] p-8 relative">
          <h2 className="text-xl font-bold font-display border-b-2 border-ink pb-4 mb-6 text-ink flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-coral inline-block"></span>
            Preferences
          </h2>

          <div className="flex items-center justify-between py-2">
            <div className="pr-6">
              <p className="font-bold text-lg font-display">Copy Media</p>
              <p className="text-sm font-semibold text-ink/60 mt-1">
                Automatically include images and videos when yeeting posts
                across platforms.
              </p>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={settings.copyImages}
              onClick={handleToggle}
              className={cn(
                "relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2",
                settings.copyImages ? "bg-mint" : "bg-ink/10",
              )}
            >
              <span
                className={cn(
                  "pointer-events-none block h-5 w-5 rounded-full bg-cream border-2 border-ink shadow-[2px_2px_0_var(--color-ink)] transition-transform",
                  settings.copyImages ? "translate-x-2" : "-translate-x-2",
                )}
              />
            </button>
          </div>
        </div>

        <div className="w-full mt-6 overflow-hidden rounded-[24px] border-2 border-ink bg-butter shadow-[8px_8px_0_var(--color-ink)] p-8 relative">
          <h2 className="text-xl font-bold font-display border-b-2 border-ink/20 pb-4 mb-6 text-ink flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-mint inline-block"></span>
            Support the Creator
          </h2>

          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold text-ink/80">
              Building and maintaining Yeet takes time. If this extension saves
              you time, consider buying me a coffee to help keep the project
              alive!
            </p>

            <button
              onClick={() =>
                browser.tabs.create({
                  url: "https://buymeacoffee.com/codesbyshivam",
                })
              }
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-ink bg-cream font-bold text-ink shadow-[4px_4px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-ink)] active:translate-y-1 active:shadow-[0px_0px_0_var(--color-ink)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                <line x1="9" x2="9" y1="1" y2="4" />
                <line x1="15" x2="15" y1="1" y2="4" />
              </svg>
              Buy Me a Coffee
            </button>
          </div>
        </div>

        <div className="text-center mt-10 text-xs font-semibold text-ink/40 flex flex-col items-center gap-1">
          <p>
            Changes are saved automatically. You can close this tab at any time.
          </p>
          {settings.lastSavedAt && (
            <p className="text-ink/60">Updated {getRelativeTime()}.</p>
          )}
        </div>
      </div>
    </div>
  );
}
