import { browser } from "wxt/browser";
import { FALLBACK_SELECTORS } from "@/lib/constants";
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
        SELECTORS = res.selectors as typeof FALLBACK_SELECTORS;
      }
    });

    observeAndTagComposers();

    document.addEventListener(
      "click",
      (e) => handleXPostClick(e, SELECTORS),
      true,
    );
    document.addEventListener(
      "keydown",
      (e) => handleXPostKeydown(e, SELECTORS),
      true,
    );
    handleXAutoPost(SELECTORS);
  },
});
