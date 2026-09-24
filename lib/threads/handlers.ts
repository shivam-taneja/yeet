import { browser } from "wxt/browser";
import type { SelectorsConfig } from "@/types/selectors";
import { doYeetToX } from "./yeet";
import { YeetProgressStatus } from "@/types/settings";
import { BackgroundAction } from "@/types/messaging";

export function handleThreadsPostClick(e: Event, selectors: SelectorsConfig) {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("yeet_auto_post")) return;

  const target = e.target as HTMLElement;
  const postBtn = target.closest(selectors.threads.postButton);

  if (postBtn) {
    const text = postBtn.textContent?.toLowerCase().trim() || "";
    // Match exactly 'post' or if it contains 'post' (e.g. with icons) and is short.
    if (text === "post" || (text.includes("post") && text.length < 15)) {
      console.log("[Yeet] Intercepted Threads Post button click.");
      doYeetToX(e, selectors);
    }
  }
}

export function handleThreadsPostKeydown(
  e: KeyboardEvent,
  selectors: SelectorsConfig,
) {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("yeet_auto_post")) return;

  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    const target = e.target as HTMLElement;
    const selectorMatch = selectors.threads.composer
      .replace(/[[\]"]/g, "")
      .split("=");

    const isComposer =
      target.closest(selectors.threads.composer) != null ||
      target.getAttribute(selectorMatch[0]!) === selectorMatch[1];

    if (isComposer) {
      console.log("[Yeet] Intercepted Threads Post via Cmd+Enter.");
      doYeetToX(e, selectors);
    }
  }
}

export async function handleThreadsAutoPost(selectors: SelectorsConfig) {
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.get("yeet_auto_post")) return;

  console.log("[Yeet] Auto-posting on Threads intent page...");

  const observer = new MutationObserver((mutations, obs) => {
    const buttons = Array.from(
      document.querySelectorAll(selectors.threads.postButton),
    );
    const postButton = buttons.find((btn) => {
      return btn.textContent?.toLowerCase().trim() === "post";
    }) as HTMLElement;

    if (postButton && !postButton.getAttribute("aria-disabled")) {
      console.log("[Yeet] Found Threads Post button, clicking it.");
      obs.disconnect();

      postButton.click();

      // Listen for the intercepted API response from our MAIN world script
      const messageListener = (event: MessageEvent) => {
        if (event.data?.type === "YEET_POST_SUCCESS" && event.data.permalink) {
          console.log(
            "[Yeet] Received post URL from interceptor:",
            event.data.permalink,
          );
          window.removeEventListener("message", messageListener);
          clearTimeout(fallbackTimer);

          browser.storage.local.get(["lastYeet"]).then((res) => {
            if (res.lastYeet) {
              browser.storage.local.set({
                lastYeet: { ...res.lastYeet, postUrl: event.data.permalink },
                yeetProgress: { status: YeetProgressStatus.DONE },
              });
            } else {
              browser.storage.local.set({
                yeetProgress: { status: YeetProgressStatus.DONE },
              });
            }
            console.log("[Yeet] Closing tab.");
            browser.runtime.sendMessage({ action: BackgroundAction.CLOSE_TAB });
          });
        }
      };

      window.addEventListener("message", messageListener);

      // Fallback: close after 5 seconds if API interception fails
      const fallbackTimer = setTimeout(() => {
        window.removeEventListener("message", messageListener);
        console.log("[Yeet] Closing tab (fallback timeout).");
        browser.runtime.sendMessage({ action: BackgroundAction.CLOSE_TAB });
      }, 5000);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}
