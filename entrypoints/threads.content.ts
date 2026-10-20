import { browser } from "wxt/browser";
import { FALLBACK_SELECTORS, mergeSelectors } from "@/lib/constants";
import { runThreadsAutoPost } from "@/lib/x-to-threads";
import { startThreadsWarmImageCache } from "@/lib/threads-to-x/warm-image-cache";
import { observeAndTagThreadsComposers } from "@/lib/threads/context";
import { trackThreadsComposerFocus } from "@/lib/threads/active-composer";
import {
  handleThreadsPostClick,
  handleThreadsPostKeydown,
} from "@/lib/threads/handlers";

export default defineContentScript({
  // Apex + www — `*.threads.com` alone misses https://threads.com/
  matches: ["*://*.threads.com/*", "*://threads.com/*"],
  main() {
    console.log("[Yeet] Threads content script ready.");

    // Prefetch composer images while user attaches — Post revokes blob: URLs.
    startThreadsWarmImageCache(FALLBACK_SELECTORS.threads.composer);

    let SELECTORS = FALLBACK_SELECTORS;
    browser.storage.local.get(["selectors"]).then((res) => {
      if (res.selectors) {
        SELECTORS = mergeSelectors(res.selectors);
      }
      runThreadsAutoPost(SELECTORS);
      observeAndTagThreadsComposers(SELECTORS.threads.composer);
    });

    trackThreadsComposerFocus(FALLBACK_SELECTORS.threads.composer);

    const onActivate = (e: Event) => {
      if (SELECTORS.features.threadsToX === false) return;
      handleThreadsPostClick(e, SELECTORS);
    };

    // Capture both — Threads sometimes fires submit work off pointerup.
    document.addEventListener("click", onActivate, true);
    document.addEventListener("pointerup", onActivate, true);

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
