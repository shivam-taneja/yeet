import { browser } from "wxt/browser";
import type { FALLBACK_SELECTORS } from "@/lib/constants";
import { doYeet } from "@/lib/x/yeet";

export function handleXPostClick(
  e: Event,
  selectors: typeof FALLBACK_SELECTORS,
): void {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("yeet_auto_post")) return;

  const target = e.target as HTMLElement;
  if (target.closest(selectors.x.postButtons)) {
    console.log("[Yeet] Intercepted X Post button click.");
    doYeet(e, selectors);
  }
}

export function handleXPostKeydown(
  e: KeyboardEvent,
  selectors: typeof FALLBACK_SELECTORS,
): void {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("yeet_auto_post")) return;

  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    const target = e.target as HTMLElement;
    const selectorMatch = selectors.x.composer
      .replace(/[[\]"]/g, "")
      .split("=");

    const isComposer =
      target.closest(selectors.x.composer) != null ||
      target.getAttribute(selectorMatch[0]!) === selectorMatch[1];

    if (isComposer) {
      console.log("[Yeet] Intercepted X Post via Cmd+Enter.");
      doYeet(e, selectors);
    }
  }
}

export async function handleXAutoPost(
  selectors: typeof FALLBACK_SELECTORS,
): Promise<void> {
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.get("yeet_auto_post")) return;

  console.log("[Yeet] Auto-posting on X intent page...");

  const observer = new MutationObserver((_, obs) => {
    const postButton = document.querySelector(
      selectors.x.intentPostButton,
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

  observer.observe(document.body, { childList: true, subtree: true });
}
