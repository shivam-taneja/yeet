"use client";

import { useState, useEffect } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ActiveState } from "@/components/popup/active-state";
import { WrongNeighborhood } from "@/components/popup/wrong-neighborhood";
import { useSettings } from "@/hooks/use-settings";

import logoUrl from "@/assets/logo.png";
import { browser } from "wxt/browser";

export interface QuickPopupProps {
  active?: boolean;
  onActiveChange?: (active: boolean) => void;
}

export function QuickPopup({
  active: externalActive,
  onActiveChange,
}: QuickPopupProps) {
  const { settings, updateSettings, isLoading } = useSettings();
  const [sourcePlatform, setSourcePlatform] = useState<"X" | "Threads" | null>(
    null,
  );
  const [isInitializing, setIsInitializing] = useState(true);

  const isControlled = externalActive !== undefined;
  const active = isControlled ? externalActive : settings.isActive;

  useEffect(() => {
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then((tabs) => {
        const url = tabs[0]?.url || "";
        if (url.includes("x.com") || url.includes("twitter.com")) {
          setSourcePlatform("X");
        } else if (url.includes("threads.com")) {
          setSourcePlatform("Threads");
        } else {
          setSourcePlatform(null);
        }
        setIsInitializing(false);
      })
      .catch(() => {
        setSourcePlatform("X");
        setIsInitializing(false);
      });
  }, []);

  const handleToggle = () => {
    if (isControlled && onActiveChange) {
      onActiveChange(!active);
    } else {
      updateSettings({ isActive: !active });
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
          className="rounded-full hover:bg-ink/5"
          aria-label="Open settings"
          onClick={() => {
            try {
              browser.tabs.create({
                url: browser.runtime.getURL("/options.html"),
              });
            } catch (e) {
              window.open(browser.runtime.getURL("/options.html"));
            }
          }}
        >
          <Settings2 className="size-5" />
        </Button>
      </div>

      <div className="p-5">
        {isInitializing || isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink"></div>
          </div>
        ) : sourcePlatform !== null ? (
          <ActiveState
            active={active}
            sourcePlatform={sourcePlatform}
            onToggle={handleToggle}
          />
        ) : (
          <WrongNeighborhood />
        )}
      </div>
    </div>
  );
}
