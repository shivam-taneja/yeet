import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformBadge } from "@/components/product-preview/platform-badge";
import { browser } from "wxt/browser";

export function WrongNeighborhood() {
  const openPlatform = (url: string) => {
    browser.tabs.create({ url });
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 text-center">
      <div className="mb-4 grid size-12 place-items-center rounded-full border-2 border-ink bg-butter">
        <ArrowRight className="size-6 text-ink" />
      </div>
      <p className="text-lg font-bold">Wrong Neighborhood</p>
      <p className="mt-2 text-sm font-semibold text-ink/70 mb-6">
        Yeet only works when you are actively browsing X or Threads. Choose a
        destination to start yeeting.
      </p>

      <div className="flex w-full flex-col gap-3">
        <Button
          variant="outline"
          className="h-12 w-full justify-start gap-3 rounded-xl border-2 border-ink bg-cream hover:bg-ink/5"
          onClick={() => openPlatform("https://x.com")}
        >
          <PlatformBadge name="X" />
          <span className="font-bold text-base">Open X</span>
        </Button>
        <Button
          variant="outline"
          className="h-12 w-full justify-start gap-3 rounded-xl border-2 border-ink bg-cream hover:bg-ink/5"
          onClick={() => openPlatform("https://threads.com")}
        >
          <PlatformBadge name="Threads" />
          <span className="font-bold text-base">Open Threads</span>
        </Button>
      </div>
    </div>
  );
}
