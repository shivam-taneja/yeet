import { cn } from "@/lib/utils";
import threadsLogoUrl from "@/assets/threads_logo.svg";

export function PlatformBadge({ name }: { name: "X" | "Threads" }) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-full border-2 border-ink text-xs font-bold",
        name === "X" ? "bg-ink text-cream" : "bg-mint text-ink",
      )}
      aria-label={name}
    >
      {name === "X" ? (
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ) : (
        <img src={threadsLogoUrl} alt="Threads" className="size-4" />
      )}
    </span>
  );
}
