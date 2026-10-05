import { browser } from "wxt/browser";

export function SupportCard() {
  return (
    <div className="w-full overflow-hidden rounded-[24px] border-2 border-ink bg-butter shadow-[8px_8px_0_var(--color-ink)] relative group transition-transform hover:-translate-y-0.5 hover:shadow-[10px_10px_0_var(--color-ink)] duration-300">
      <div className="pointer-events-none absolute -right-6 -top-6 size-20 rounded-full border-2 border-ink bg-coral/25" />
      <div className="pointer-events-none absolute -bottom-4 right-16 size-14 rotate-12 border-2 border-ink bg-mint/25" />

      <div className="relative z-10 flex flex-col gap-5 p-5 sm:p-6">
        <div>
          <h2 className="text-lg font-black font-display text-ink flex items-center gap-2">
            <span className="text-xl leading-none">☕️</span>
            Fuel the Dev!
          </h2>
          <p className="mt-2 text-sm font-bold text-ink/75 leading-snug">
            Yeet is built with blood, sweat, and caffeine. If it saves you
            hours, a coffee goes a long way!
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            browser.tabs.create({
              url: "https://buymeacoffee.com/codesbyshivam",
            })
          }
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border-2 border-ink bg-white px-4 text-sm font-black text-ink shadow-[3px_3px_0_var(--color-ink)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_var(--color-ink)] hover:bg-mint active:translate-y-0.5 active:shadow-none cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
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
  );
}
