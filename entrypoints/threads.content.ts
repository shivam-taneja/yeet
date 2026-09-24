import { browser } from "wxt/browser";
import { FALLBACK_SELECTORS, mergeSelectors } from "@/lib/constants";
import {
  handleThreadsAutoPost,
  handleThreadsPostClick,
  handleThreadsPostKeydown,
} from "@/lib/threads/handlers";

export default defineContentScript({
  matches: ["*://*.threads.com/*"],
  main() {
    console.log("[Yeet] Threads Content Script woke up.");
    console.log(
      "[Yeet] ℹ️  Threads → X cross-posting is gated by OTA kill-switch.",
    );

    let SELECTORS = FALLBACK_SELECTORS;
    browser.storage.local.get(["selectors"]).then((res) => {
      if (res.selectors) {
        SELECTORS = mergeSelectors(res.selectors);
      }
    });

    document.addEventListener(
      "click",
      (e) => {
        if (SELECTORS.features.threadsToX === true) {
          handleThreadsPostClick(e, SELECTORS);
        }
      },
      true,
    );

    document.addEventListener(
      "keydown",
      (e) => {
        if (SELECTORS.features.threadsToX === true) {
          handleThreadsPostKeydown(e, SELECTORS);
        }
      },
      true,
    );

    // X → Threads auto-post: fires when this page is opened as an intent URL
    handleThreadsAutoPost(SELECTORS);
  },
});
