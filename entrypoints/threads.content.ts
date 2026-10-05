import { browser } from "wxt/browser";
import { FALLBACK_SELECTORS, mergeSelectors } from "@/lib/constants";
import { runThreadsAutoPost } from "@/lib/x-to-threads";
import { observeAndTagThreadsComposers } from "@/lib/threads/context";
import {
  handleThreadsPostClick,
  handleThreadsPostKeydown,
} from "@/lib/threads/handlers";

export default defineContentScript({
  matches: ["*://*.threads.com/*"],
  main() {
    console.log("[Yeet] Threads content script ready.");

    let SELECTORS = FALLBACK_SELECTORS;
    browser.storage.local.get(["selectors"]).then((res) => {
      if (res.selectors) {
        SELECTORS = mergeSelectors(res.selectors);
      }
      runThreadsAutoPost(SELECTORS);
      observeAndTagThreadsComposers(SELECTORS.threads.composer);
    });

    document.addEventListener(
      "click",
      (e) => {
        if (SELECTORS.features.threadsToX !== false) {
          handleThreadsPostClick(e, SELECTORS);
        }
      },
      true,
    );
    document.addEventListener(
      "keydown",
      (e) => {
        if (SELECTORS.features.threadsToX !== false) {
          handleThreadsPostKeydown(e, SELECTORS);
        }
      },
      true,
    );
  },
});
