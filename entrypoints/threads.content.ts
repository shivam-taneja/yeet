import { browser } from "wxt/browser";
import { FALLBACK_SELECTORS } from "@/lib/constants";
import { handleThreadsAutoPost } from "@/lib/threads/handlers";

export default defineContentScript({
  matches: ["*://*.threads.com/*"],
  main() {
    console.log("[Yeet] Threads Content Script woke up.");
    console.log(
      "[Yeet] ℹ️  Threads → X cross-posting is coming soon. X → Threads is active.",
    );

    let SELECTORS = FALLBACK_SELECTORS;
    browser.storage.local.get(["selectors"]).then((res) => {
      if (res.selectors) {
        SELECTORS = res.selectors as typeof FALLBACK_SELECTORS;
      }
    });

    // X → Threads auto-post: fires when this page is opened as an intent URL
    handleThreadsAutoPost(SELECTORS);
  },
});
