import { browser } from "wxt/browser";
import type { AppSettings } from "@/types/settings";

export default defineContentScript({
  matches: ["*://*.x.com/*"],
  main() {
    console.log("[Yeet] X Content Script woke up. Ready to yeet.");

    // Helper to get text from Draft.js editor
    function extractTextFromDraftEditor(containerSelector: string) {
      const container = document.querySelector(containerSelector);
      if (!container) return "";

      const textBlocks = container.querySelectorAll('[data-text="true"]');
      let text = "";
      textBlocks.forEach((block) => {
        text += block.textContent + "\n";
      });
      return text.trim();
    }

    async function doYeet() {
      const storage = await browser.storage.local.get(["isActive"]);
      if (storage.isActive === false) return;

      const text = extractTextFromDraftEditor(
        '[data-testid="tweetTextarea_0"]',
      );

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
      const target = e.target as HTMLElement;
      const postBtn = target.closest(
        '[data-testid="tweetButtonInline"], [data-testid="tweetButton"]',
      );
      if (postBtn) {
        console.log("[Yeet] Intercepted X Post button click.");
        doYeet();
      }
    }

    function handleXPostKeydown(e: KeyboardEvent) {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        const target = e.target as HTMLElement;
        const isComposer =
          target.closest('[data-testid="tweetTextarea_0"]') != null ||
          target.getAttribute("data-testid") === "tweetTextarea_0";
        if (isComposer) {
          console.log("[Yeet] Intercepted X Post via Cmd+Enter.");
          doYeet();
        }
      }
    }

    document.addEventListener("click", handleXPostClick, true); // Use capture phase
    document.addEventListener("keydown", handleXPostKeydown, true); // Use capture phase
  },
});
