import { browser } from "wxt/browser";

export function SupportCard() {
  return (
    <div className="w-full overflow-hidden rounded-[24px] border-2 border-ink bg-butter shadow-[8px_8px_0_var(--color-ink)] p-8 relative">
      <h2 className="text-xl font-bold font-display border-b-2 border-ink/20 pb-4 mb-6 text-ink flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-mint inline-block"></span>
        Support the Creator
      </h2>
      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-ink/80">
          Building Yeet takes time. If this extension saves you time, consider
          buying me a coffee to keep it alive!
        </p>
        <button
          onClick={() =>
            browser.tabs.create({
              url: "https://buymeacoffee.com/codesbyshivam",
            })
          }
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-ink bg-cream font-bold text-ink shadow-[4px_4px_0_var(--color-ink)] transition-transform hover:-translate-y-0.5 hover:shadow-[6px_6px_0_var(--color-ink)] active:translate-y-1 active:shadow-[0px_0px_0_var(--color-ink)] cursor-pointer"
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
  );
}
