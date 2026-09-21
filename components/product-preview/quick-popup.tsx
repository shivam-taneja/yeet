"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  Pause,
  Play,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlatformBadge } from "@/components/product-preview/platform-badge";
import { StatusPill } from "@/components/product-preview/status-pill";

import logoUrl from "@/assets/logo.png";

export interface QuickPopupProps {
  active?: boolean;
  onActiveChange?: (active: boolean) => void;
}

export function QuickPopup({
  active: externalActive,
  onActiveChange,
}: QuickPopupProps) {
  const [internalActive, setInternalActive] = useState(true);

  const isControlled = externalActive !== undefined;
  const active = isControlled ? externalActive : internalActive;

  const handleToggle = () => {
    if (isControlled && onActiveChange) {
      onActiveChange(!active);
    } else {
      setInternalActive(!active);
    }
  };

  return (
    <div className="w-full overflow-hidden border-2 border-ink bg-cream shadow-[8px_8px_0_var(--color-ink)] text-ink">
      <div className="flex items-center justify-between border-b-2 border-ink px-5 py-4">
        <img
          src={logoUrl}
          alt="Yeet"
          width={956}
          height={444}
          className="h-9 w-auto object-contain"
        />
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label="Open settings"
        >
          <Settings2 className="size-5" />
        </Button>
      </div>

      <div className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <StatusPill active={active} />
          <span className="text-xs font-semibold text-ink/50">
            2 accounts linked
          </span>
        </div>

        <div className="rounded-2xl border-2 border-ink bg-grape p-4 text-cream">
          <div className="flex items-center justify-center gap-3">
            <PlatformBadge name="X" />
            <div className="flex items-center gap-1 text-butter">
              <span className="h-0.5 w-5 bg-butter" />
              <ArrowRight className="size-5" />
            </div>
            <PlatformBadge name="Threads" />
          </div>
          <p className="mt-3 text-center text-sm font-semibold">
            {active
              ? "Your next post will fly across."
              : "Nothing moves while Yeet is paused."}
          </p>
        </div>

        <div className="my-5 flex items-start gap-3 rounded-2xl border-2 border-ink bg-background p-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-mint">
            <Check className="size-5" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold">Last yeet landed</p>
            <p className="mt-1 truncate text-xs text-ink/55">
              “Small wins deserve a little noise.”
            </p>
            <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-ink/45">
              <Clock3 className="size-3" /> 18 seconds ago
            </p>
          </div>
        </div>

        <Button
          onClick={handleToggle}
          className="h-12 w-full rounded-full border-2 border-ink bg-coral text-base font-bold text-cream shadow-[4px_4px_0_var(--color-ink)] hover:bg-coral/90"
        >
          {active ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {active ? "Pause Yeet" : "Start Yeeting"}
        </Button>
      </div>
    </div>
  );
}
