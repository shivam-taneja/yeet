import { browser } from "wxt/browser";
import { PLATFORM_SELECTORS } from "@/lib/constants";
import { extractTextFromLexicalEditor } from "@/lib/dom-utils";

export default defineContentScript({
  matches: ["*://*.threads.com/*", "*://*.threads.net/*"],
  main() {
    console.log("[Yeet] Threads Content Script woke up. Ready to auto-yeet.");

    async function doYeetToX() {
      const storage = await browser.storage.local.get(["isActive"]);
      if (storage.isActive === false) return;

      const text = extractTextFromLexicalEditor(
        PLATFORM_SELECTORS.threads.composer,
      );
      if (!text) {
        console.log("[Yeet] No text found to cross-post.");
        return;
      }

      if (text.length > 280) {
        alert(
          "Yeet failed: X only supports up to 280 characters for standard posts! Your post is too big to Yeet.",
        );
        return;
      }

      console.log("[Yeet] Extracted text from Threads:", text);
      const encodedText = encodeURIComponent(text);
      const url = `https://x.com/intent/tweet?text=${encodedText}&yeet_auto_post=true`;

      browser.storage.local.set({
        lastYeet: {
          text,
          timestamp: Date.now(),
          platform: "X",
        },
      });

      browser.runtime.sendMessage({ action: "openBackgroundTab", url });
    }

    function handleThreadsPostClick(e: Event) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("yeet_auto_post")) return;

      const target = e.target as HTMLElement;
      const postBtn = target.closest(PLATFORM_SELECTORS.threads.postButton);

      if (postBtn && postBtn.textContent?.toLowerCase().trim() === "post") {
        console.log("[Yeet] Intercepted Threads Post button click.");
        doYeetToX();
      }
    }

    function handleThreadsPostKeydown(e: KeyboardEvent) {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("yeet_auto_post")) return;

      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        const target = e.target as HTMLElement;
        const selectorMatch = PLATFORM_SELECTORS.threads.composer
          .replace(/[[\]"]/g, "")
          .split("=");

        const isComposer =
          target.closest(PLATFORM_SELECTORS.threads.composer) != null ||
          target.getAttribute(selectorMatch[0]!) === selectorMatch[1];

        if (isComposer) {
          console.log("[Yeet] Intercepted Threads Post via Cmd+Enter.");
          doYeetToX();
        }
      }
    }

    async function handleThreadsAutoPost() {
      const urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.get("yeet_auto_post")) return;

      console.log("[Yeet] Auto-posting on Threads intent page...");

      const observer = new MutationObserver((mutations, obs) => {
        const buttons = Array.from(
          document.querySelectorAll(PLATFORM_SELECTORS.threads.postButton),
        );
        const postButton = buttons.find((btn) => {
          return btn.textContent?.toLowerCase().trim() === "post";
        }) as HTMLElement;

        if (postButton && !postButton.getAttribute("aria-disabled")) {
          console.log("[Yeet] Found Threads Post button, clicking it.");
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

    // Attach event listeners
    document.addEventListener("click", handleThreadsPostClick, true);
    document.addEventListener("keydown", handleThreadsPostKeydown, true);
    handleThreadsAutoPost();
  },
});
