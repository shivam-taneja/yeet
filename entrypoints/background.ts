import { browser } from "wxt/browser";
import { BackgroundAction } from "@/types/messaging";

export default defineBackground(() => {
  console.log("[Yeet] Background service worker registered.");

  const SELECTORS_URL =
    "https://raw.githubusercontent.com/shivam-taneja/yeet/main/lib/selectors.json";

  async function fetchLatestSelectors() {
    if (import.meta.env.DEV) {
      console.log(
        "[Yeet] Dev mode: Skipping OTA fetch, local JSON is bundled directly.",
      );
      return;
    }

    try {
      const res = await fetch(SELECTORS_URL);
      if (res.ok) {
        const data = await res.json();
        await browser.storage.local.set({ selectors: data });
        console.log("[Yeet] OTA selectors updated successfully.");
      }
    } catch (error) {
      console.error("[Yeet] Failed to fetch OTA selectors:", error);
    }
  }

  // Fetch on install or startup
  browser.runtime.onInstalled.addListener(fetchLatestSelectors);
  browser.runtime.onStartup.addListener(fetchLatestSelectors);

  // Listen for messages from content scripts
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (
      message.action === BackgroundAction.OPEN_BACKGROUND_TAB &&
      message.url
    ) {
      // Caller sets `active` — X→Threads keeps the intent tab in the background.
      const active = Boolean(message.active);
      console.log(
        "[Yeet] Opening tab:",
        message.url,
        active ? "(focused)" : "(background)",
      );
      void browser.tabs.create({ url: message.url, active }).then(async (tab) => {
        if (!active || tab.id == null) return;
        try {
          await browser.tabs.update(tab.id, { active: true });
          if (tab.windowId != null) {
            await browser.windows.update(tab.windowId, { focused: true });
          }
        } catch (err) {
          console.warn("[Yeet] Failed to focus opened tab:", err);
        }
      });
    }

    if (message.action === BackgroundAction.CLOSE_TAB) {
      if (sender.tab?.id) {
        console.log("[Yeet] Closing tab:", sender.tab.id);
        browser.tabs.remove(sender.tab.id);
      }
    }

    if (message.action === BackgroundAction.FOCUS_TAB) {
      if (sender.tab?.id) {
        const tabId = sender.tab.id;
        const windowId = sender.tab.windowId;
        void browser.tabs.update(tabId, { active: true }).then(async () => {
          if (windowId != null) {
            try {
              await browser.windows.update(windowId, { focused: true });
            } catch {
              /* ignore */
            }
          }
        });
      }
    }
  });
});
