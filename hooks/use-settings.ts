import { useState, useEffect, useCallback } from "react";
import { browser } from "wxt/browser";
import type { AppSettings } from "@/types/settings";
import { YeetProgressStatus } from "@/types/settings";

const defaultSettings: AppSettings = {
  copyImages: true,
  isActive: true,
  xContexts: {
    "new-post": true,
    "mention-post": false,
    quote: false,
    reply: false,
    thread: false,
  },
  threadsContexts: {
    "new-post": true,
    "mention-post": false,
    quote: false,
    reply: false,
    thread: false,
  },
  lastSavedAt: null,
  lastYeet: null,
  yeetProgress: { status: YeetProgressStatus.IDLE },
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load initially
  useEffect(() => {
    browser.storage.local.get(Object.keys(defaultSettings)).then((result) => {
      setSettings((prev) => ({
        ...prev,
        ...result,
        // Override with loaded values if they exist, fallback to defaults
        copyImages:
          result.copyImages !== undefined
            ? (result.copyImages as boolean)
            : defaultSettings.copyImages,
        isActive:
          result.isActive !== undefined
            ? (result.isActive as boolean)
            : defaultSettings.isActive,
        xContexts:
          result.xContexts !== undefined
            ? (result.xContexts as AppSettings["xContexts"])
            : defaultSettings.xContexts,
        lastSavedAt:
          result.lastSavedAt !== undefined
            ? (result.lastSavedAt as number)
            : defaultSettings.lastSavedAt,
        lastYeet:
          result.lastYeet !== undefined
            ? (result.lastYeet as typeof defaultSettings.lastYeet)
            : defaultSettings.lastYeet,
        yeetProgress:
          result.yeetProgress !== undefined
            ? (result.yeetProgress as typeof defaultSettings.yeetProgress)
            : defaultSettings.yeetProgress,
      }));
      setIsLoading(false);
    });
  }, []);

  // Sync state changes across tabs/popup (if another context changes storage)
  useEffect(() => {
    const handleStorageChange = (
      changes: Record<string, any>,
      areaName: string,
    ) => {
      if (areaName === "local") {
        setSettings((prev) => {
          const next = { ...prev };
          let hasChanges = false;

          for (const key of Object.keys(defaultSettings) as Array<
            keyof AppSettings
          >) {
            if (changes[key]) {
              next[key] = changes[key].newValue as never;
              hasChanges = true;
            }
          }

          return hasChanges ? next : prev;
        });
      }
    };

    browser.storage.onChanged.addListener(handleStorageChange);
    return () => browser.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const timestamp = Date.now();
    const finalUpdates = {
      ...updates,
      lastSavedAt: timestamp,
    };

    // Optimistic UI update
    setSettings((prev) => ({ ...prev, ...finalUpdates }));

    // Save to chrome storage
    await browser.storage.local.set(finalUpdates);
  }, []);

  return { settings, updateSettings, isLoading };
}
