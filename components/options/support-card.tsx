import { browser } from "wxt/browser";

export function SupportCard() {
  return (
    <div className="w-full h-full overflow-hidden rounded-[24px] border-2 border-ink bg-butter shadow-[8px_8px_0_var(--color-ink)] relative group transition-transform hover:-translate-y-1 hover:shadow-[12px_12px_0_var(--color-ink)] duration-300">
      {/* Decorative Brutalist Shapes */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-coral rounded-full border-2 border-ink opacity-30 group-hover:scale-110 transition-transform duration-500"></div>
      <div className="absolute right-32 -bottom-12 w-24 h-24 bg-mint rotate-12 border-2 border-ink opacity-30 group-hover:-rotate-12 transition-transform duration-500"></div>

      <div className="p-6 md:p-8 relative z-10 flex flex-col items-start justify-between gap-6 h-full">
        <div className="flex-1 w-full">
          <h2 className="text-xl md:text-2xl font-black font-display text-ink flex items-center gap-3 mb-2">
            <span className="text-2xl md:text-3xl">☕️</span>
            Fuel the Dev!
          </h2>
          <p className="text-sm md:text-base font-bold text-ink/75 leading-relaxed">
            Yeet is built with blood, sweat, and caffeine. If it saves you
            hours, a coffee goes a long way!
          </p>
        </div>
        <button
          onClick={() =>
            browser.tabs.create({
              url: "https://buymeacoffee.com/codesbyshivam",
            })
          }
          className="inline-flex h-14 w-full md:w-auto px-8 items-center justify-center gap-3 rounded-xl border-2 border-ink bg-white font-black text-lg text-ink shadow-[4px_4px_0_var(--color-ink)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[8px_8px_0_var(--color-ink)] hover:bg-mint active:translate-y-1 active:shadow-[0px_0px_0_var(--color-ink)] cursor-pointer whitespace-nowrap"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
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
  );
}
