import { useState, useEffect, useCallback } from "react";
import { browser } from "wxt/browser";
import type { AppSettings } from "@/types/settings";
import {
  APP_SETTINGS_STORAGE_KEYS,
  DEFAULT_APP_SETTINGS,
} from "@/lib/settings-defaults";
import { clearPendingText } from "@/lib/cross-post/pending-text";

function mergeLoadedSettings(result: Record<string, unknown>): AppSettings {
  return {
    ...DEFAULT_APP_SETTINGS,
    copyImages:
      result.copyImages !== undefined
        ? (result.copyImages as boolean)
        : DEFAULT_APP_SETTINGS.copyImages,
    copyVideos:
      result.copyVideos !== undefined
        ? (result.copyVideos as boolean)
        : DEFAULT_APP_SETTINGS.copyVideos,
    copyGifs:
      result.copyGifs !== undefined
        ? (result.copyGifs as boolean)
        : DEFAULT_APP_SETTINGS.copyGifs,
    isActive:
      result.isActive !== undefined
        ? (result.isActive as boolean)
        : DEFAULT_APP_SETTINGS.isActive,
    xContexts:
      result.xContexts !== undefined
        ? (result.xContexts as AppSettings["xContexts"])
        : DEFAULT_APP_SETTINGS.xContexts,
    threadsContexts:
      result.threadsContexts !== undefined
        ? (result.threadsContexts as AppSettings["threadsContexts"])
        : DEFAULT_APP_SETTINGS.threadsContexts,
    lastSavedAt:
      result.lastSavedAt !== undefined
        ? (result.lastSavedAt as number | null)
        : DEFAULT_APP_SETTINGS.lastSavedAt,
    lastYeet:
      result.lastYeet !== undefined
        ? (result.lastYeet as AppSettings["lastYeet"])
        : DEFAULT_APP_SETTINGS.lastYeet,
    yeetProgress:
      result.yeetProgress !== undefined
        ? (result.yeetProgress as AppSettings["yeetProgress"])
        : DEFAULT_APP_SETTINGS.yeetProgress,
  };
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    browser.storage.local.get(APP_SETTINGS_STORAGE_KEYS).then((result) => {
      setSettings(mergeLoadedSettings(result));
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleStorageChange = (
      changes: Record<string, { newValue?: unknown }>,
      areaName: string,
    ) => {
      if (areaName !== "local") return;

      setSettings((prev) => {
        let next = prev;
        let hasChanges = false;

        for (const key of APP_SETTINGS_STORAGE_KEYS) {
          if (changes[key]) {
            if (!hasChanges) {
              next = { ...prev };
              hasChanges = true;
            }
            next[key] = changes[key].newValue as never;
          }
        }

        return hasChanges ? next : prev;
      });
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

    setSettings((prev) => ({ ...prev, ...finalUpdates }));
    await browser.storage.local.set(finalUpdates);
  }, []);

  const resetToDefaults = useCallback(async () => {
    const timestamp = Date.now();
    const next: AppSettings = {
      ...DEFAULT_APP_SETTINGS,
      lastSavedAt: timestamp,
    };

    setSettings(next);
    await browser.storage.local.set(next);
    await clearPendingText();
  }, []);

  return { settings, updateSettings, resetToDefaults, isLoading };
}
