import { browser } from "wxt/browser";
import type { AppSettings } from "@/types/settings";

export default defineContentScript({
  matches: ["*://*.threads.com/*", "*://*.threads.net/*"],
  main() {
    console.log("[Yeet] Threads Content Script woke up. Ready to auto-yeet.");

    function extractTextFromLexicalEditor(containerSelector: string) {
      const container = document.querySelector(
        containerSelector,
      ) as HTMLElement;
      if (!container) return "";

      // Lexical editor uses innerText quite well for newlines
      return container.innerText.trim();
    }

    async function doYeetToX() {
      const storage = await browser.storage.local.get(["isActive"]);
      if (storage.isActive === false) return;

      const text = extractTextFromLexicalEditor('[data-lexical-editor="true"]');
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
      const target = e.target as HTMLElement;
      const postBtn = target.closest('div[role="button"]');

      if (postBtn && postBtn.textContent?.toLowerCase().trim() === "post") {
        console.log("[Yeet] Intercepted Threads Post button click.");
        doYeetToX();
      }
    }

    function handleThreadsPostKeydown(e: KeyboardEvent) {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        const target = e.target as HTMLElement;
        const isComposer =
          target.closest('[data-lexical-editor="true"]') != null ||
          target.getAttribute("data-lexical-editor") === "true";
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
          document.querySelectorAll('div[role="button"]'),
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
