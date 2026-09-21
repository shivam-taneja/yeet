import { browser } from "wxt/browser";

export default defineContentScript({
  matches: ["*://*.threads.com/*", "*://*.threads.net/*"],
  main() {
    console.log("[Yeet] Threads Content Script woke up. Ready to auto-yeet.");

    async function handleThreadsAutoPost() {
      const urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.get("yeet_auto_post")) return;

      console.log("[Yeet] Auto-posting on Threads intent page...");

      // Need to wait for the page to load and the Post button to be ready
      // Threads uses complex obfuscated class names, so we look for a button containing "Post"
      const observer = new MutationObserver((mutations, obs) => {
        const buttons = Array.from(
          document.querySelectorAll('div[role="button"]'),
        );
        const postButton = buttons.find((btn) => {
          return btn.textContent?.toLowerCase().trim() === "post";
        }) as HTMLElement;

        if (postButton && !postButton.getAttribute("aria-disabled")) {
          console.log("[Yeet] Found Threads Post button, clicking it.");
          obs.disconnect(); // Stop observing

          // Click the button
          postButton.click();

          // Wait a bit for the post request to complete, then close the tab
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

    handleThreadsAutoPost();
  },
});
