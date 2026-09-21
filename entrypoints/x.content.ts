import { browser } from "wxt/browser";
import { PLATFORM_SELECTORS } from "@/lib/constants";
import { extractTextFromDraftEditor } from "@/lib/dom-utils";

export default defineContentScript({
  matches: ["*://*.x.com/*"],
  main() {
    console.log("[Yeet] X Content Script woke up. Ready to yeet.");

    async function doYeet() {
      const storage = await browser.storage.local.get(["isActive"]);
      if (storage.isActive === false) return;

      const text = extractTextFromDraftEditor(PLATFORM_SELECTORS.x.composer);

      if (!text) {
        console.log("[Yeet] No text found to cross-post.");
        return;
      }

      if (text.length > 500) {
        alert(
          "Yeet failed: Threads only supports up to 500 characters per post! Your post is too big to Yeet.",
        );
        return;
      }

      console.log("[Yeet] Extracted text:", text);
      const encodedText = encodeURIComponent(text);
      const url = `https://www.threads.com/intent/post?text=${encodedText}&yeet_auto_post=true`;

      browser.storage.local.set({
        lastYeet: {
          text,
          timestamp: Date.now(),
          platform: "Threads",
        },
      });

      browser.runtime.sendMessage({ action: "openBackgroundTab", url });
    }

    function handleXPostClick(e: Event) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("yeet_auto_post")) return;

      const target = e.target as HTMLElement;
      const postBtn = target.closest(PLATFORM_SELECTORS.x.postButtons);
      if (postBtn) {
        console.log("[Yeet] Intercepted X Post button click.");
        doYeet();
      }
    }

    function handleXPostKeydown(e: KeyboardEvent) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("yeet_auto_post")) return;

      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        const target = e.target as HTMLElement;
        const selectorMatch = PLATFORM_SELECTORS.x.composer
          .replace(/[[\]"]/g, "")
          .split("=");

        const isComposer =
          target.closest(PLATFORM_SELECTORS.x.composer) != null ||
          target.getAttribute(selectorMatch[0]!) === selectorMatch[1];

        if (isComposer) {
          console.log("[Yeet] Intercepted X Post via Cmd+Enter.");
          doYeet();
        }
      }
    }

    async function handleXAutoPost() {
      const urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.get("yeet_auto_post")) return;

      console.log("[Yeet] Auto-posting on X intent page...");

      const observer = new MutationObserver((mutations, obs) => {
        const postButton = document.querySelector(
          PLATFORM_SELECTORS.x.intentPostButton,
        ) as HTMLButtonElement;

        if (
          postButton &&
          !postButton.getAttribute("aria-disabled") &&
          !postButton.disabled
        ) {
          console.log("[Yeet] Found X Post button, clicking it.");
          obs.disconnect();

          postButton.click();

          setTimeout(() => {
            console.log("[Yeet] Closing tab.");
            browser.runtime.sendMessage({ action: "closeTab" });
          }, 3000);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    document.addEventListener("click", handleXPostClick, true); // Use capture phase
    document.addEventListener("keydown", handleXPostKeydown, true); // Use capture phase
    handleXAutoPost();
  },
});
