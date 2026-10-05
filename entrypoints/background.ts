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
      console.log("[Yeet] Opening background tab:", message.url);
      // X → Threads always stays in the background.
      browser.tabs.create({ url: message.url, active: false });
    }

    if (message.action === BackgroundAction.CLOSE_TAB) {
      if (sender.tab?.id) {
        console.log("[Yeet] Closing tab:", sender.tab.id);
        browser.tabs.remove(sender.tab.id);
      }
    }

    if (message.action === BackgroundAction.FOCUS_TAB) {
      if (sender.tab?.id) {
        browser.tabs.update(sender.tab.id, { active: true });
      }
    }
  });
});
