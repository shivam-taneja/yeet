import { SELECTORS } from "@/lib/constants";
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
    startThreadsWarmImageCache(SELECTORS.threads.composer);

    runThreadsAutoPost(SELECTORS);
    observeAndTagThreadsComposers(SELECTORS.threads.composer);
    trackThreadsComposerFocus(SELECTORS.threads.composer);

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
