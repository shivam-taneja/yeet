import { browser } from "wxt/browser";
import { FALLBACK_SELECTORS, mergeSelectors } from "@/lib/constants";
import { observeAndTagComposers } from "@/lib/x/context";
import {
  handleXPostClick,
  handleXPostKeydown,
  handleXAutoPost,
} from "@/lib/x/handlers";

export default defineContentScript({
  matches: ["*://*.x.com/*"],
  main() {
    console.log("[Yeet] X Content Script woke up. Ready to yeet.");

    let SELECTORS = FALLBACK_SELECTORS;
    browser.storage.local.get(["selectors"]).then((res) => {
      if (res.selectors) {
        SELECTORS = mergeSelectors(res.selectors);
      }
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
    handleXAutoPost(SELECTORS);
  },
});
