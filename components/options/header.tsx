import { browser } from "wxt/browser";
import logoUrl from "@/assets/logo.png";

export function Header() {
  return (
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
  );
}
