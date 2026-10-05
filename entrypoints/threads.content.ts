import { browser } from "wxt/browser";
import { FALLBACK_SELECTORS, mergeSelectors } from "@/lib/constants";
import { runThreadsAutoPost } from "@/lib/x-to-threads";

export default defineContentScript({
  matches: ["*://*.threads.com/*"],
  main() {
    console.log("[Yeet] Threads content script ready (X → Threads auto-post).");

    let SELECTORS = FALLBACK_SELECTORS;
    browser.storage.local.get(["selectors"]).then((res) => {
      if (res.selectors) {
        SELECTORS = mergeSelectors(res.selectors);
      }
    });

    runThreadsAutoPost(SELECTORS);
  },
});
