import { browser } from "wxt/browser";
import { FALLBACK_SELECTORS, mergeSelectors } from "@/lib/constants";
import { observeAndTagComposers } from "@/lib/x/context";
import { handleXPostClick, handleXPostKeydown } from "@/lib/x/handlers";
import { cacheXPremiumFlag } from "@/lib/x/premium";
import { runXAutoPost } from "@/lib/threads-to-x";
import { startWarmImageCache } from "@/lib/x-to-threads/warm-image-cache";

export default defineContentScript({
  matches: ["*://*.x.com/*", "*://x.com/*"],
  main() {
    console.log("[Yeet] X Content Script woke up. Ready to yeet.");

    // Prefetch composer images while user attaches — Post revokes blob: URLs.
    startWarmImageCache();

    let SELECTORS = FALLBACK_SELECTORS;
    browser.storage.local.get(["selectors"]).then((res) => {
      if (res.selectors) {
        SELECTORS = mergeSelectors(res.selectors);
      }
      if (SELECTORS.features.threadsToX !== false) {
        runXAutoPost(SELECTORS);
      }
    });

    void cacheXPremiumFlag();
    const premiumObserver = new MutationObserver(() => {
      void cacheXPremiumFlag();
    });
    premiumObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });

    observeAndTagComposers();

    document.addEventListener(
      "click",
      (e) => {
        if (SELECTORS.features.xToThreads !== false) {
          handleXPostClick(e, SELECTORS);
        }
      },
      true,
    );
    document.addEventListener(
      "keydown",
      (e) => {
        if (SELECTORS.features.xToThreads !== false) {
          handleXPostKeydown(e, SELECTORS);
        }
      },
      true,
    );
  },
});
