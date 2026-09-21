import { useState, useEffect } from "react";
import { browser } from "wxt/browser";
import logoUrl from "@/assets/logo.png";

export default function App() {
  const [copyImages, setCopyImages] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load setting from extension storage
    browser.storage.local.get("copyImages").then((result) => {
      if (result.copyImages !== undefined) {
        setCopyImages(result.copyImages as boolean);
      } else {
        setCopyImages(true);
      }
      setIsLoading(false);
    });
  }, []);

  const handleToggle = async () => {
    const newVal = !copyImages;
    setCopyImages(newVal);
    await browser.storage.local.set({ copyImages: newVal });
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-cream font-body text-ink flex flex-col items-center py-12 px-4 selection:bg-mint/30">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex flex-col items-center mb-10">
          <img
            src={logoUrl}
            alt="Yeet"
            className="h-16 w-auto mb-6 drop-shadow-[4px_4px_0_var(--color-ink)]"
          />
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
              aria-checked={copyImages}
              onClick={handleToggle}
              className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${
                copyImages ? "bg-mint" : "bg-ink/10"
              }`}
            >
              <span
                className={`pointer-events-none block h-5 w-5 rounded-full bg-cream border-2 border-ink shadow-[2px_2px_0_var(--color-ink)] transition-transform ${
                  copyImages ? "translate-x-2" : "-translate-x-2"
                }`}
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

        <p className="text-center mt-10 text-xs font-semibold text-ink/40">
          Changes are saved automatically. You can close this tab at any time.
        </p>
      </div>
    </div>
  );
}
