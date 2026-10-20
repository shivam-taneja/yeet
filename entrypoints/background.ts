import { browser } from "wxt/browser";
import { BackgroundAction } from "@/types/messaging";

export default defineBackground(() => {
  console.log("[Yeet] Background service worker registered.");

  // Drop any leftover OTA selector overlay from older builds.
  browser.runtime.onInstalled.addListener(() => {
    void browser.storage.local.remove("selectors");
  });

  browser.runtime.onMessage.addListener((message, sender) => {
    if (
      message.action === BackgroundAction.OPEN_BACKGROUND_TAB &&
      message.url
    ) {
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
