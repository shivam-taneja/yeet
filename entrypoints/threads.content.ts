import { browser } from "wxt/browser";
import { FALLBACK_SELECTORS } from "@/lib/constants";
import {
  handleThreadsPostClick,
  handleThreadsPostKeydown,
  handleThreadsAutoPost,
} from "@/lib/threads/handlers";
import { observeAndTagThreadsComposers } from "@/lib/threads/context";

export default defineContentScript({
  matches: ["*://*.threads.com/*"],
  main() {
    console.log("[Yeet] Threads Content Script woke up. Ready to auto-yeet.");

    let SELECTORS = FALLBACK_SELECTORS;
    browser.storage.local.get(["selectors"]).then((res) => {
      if (res.selectors) {
        SELECTORS = res.selectors as typeof FALLBACK_SELECTORS;
      }
    });

    // Start tracking context
    observeAndTagThreadsComposers();

    // Attach event listeners
    document.addEventListener(
      "click",
      (e) => handleThreadsPostClick(e, SELECTORS),
      true,
    );
    document.addEventListener(
      "keydown",
      (e) => handleThreadsPostKeydown(e, SELECTORS),
      true,
    );
    handleThreadsAutoPost(SELECTORS);
  },
});
