import { browser } from "wxt/browser";
import { getPendingMedia, clearPendingMedia } from "@/lib/media-storage";
import type { SelectorsConfig } from "@/types/selectors";
import { YeetProgressStatus } from "@/types/settings";
import { BackgroundAction } from "@/types/messaging";

const MAX_IMAGES = 10;

export async function injectPendingImages(
  selectors: SelectorsConfig,
): Promise<void> {
  const files = await getPendingMedia();
  if (files.length === 0) return;

  const composer = document.querySelector(selectors.threads.composer);
  if (!composer) {
    console.warn("[Yeet] Composer not found, skipping image injection.");
    return;
  }

  const capped = files.slice(0, MAX_IMAGES);
  if (files.length > MAX_IMAGES) {
    console.warn(
      `[Yeet] More than ${MAX_IMAGES} images — capping to first ${MAX_IMAGES}.`,
    );
  }

  console.log(`[Yeet] Injecting ${capped.length} image(s) into Threads...`);

  const dataTransfer = new DataTransfer();
  capped.forEach((file) => dataTransfer.items.add(file));

  const pasteEvent = new ClipboardEvent("paste", {
    clipboardData: dataTransfer,
    bubbles: true,
    cancelable: true,
  });

  composer.dispatchEvent(pasteEvent);
  await clearPendingMedia();
  console.log("[Yeet] Images injected and cache cleared.");

  // Give the editor a moment to process before posting
  await new Promise((resolve) => setTimeout(resolve, 800));
}

export function setupPostSuccessListener(): void {
  const fallbackTimer = setTimeout(() => {
    window.removeEventListener("message", messageListener);
    console.log("[Yeet] Closing tab (fallback timeout).");
    browser.storage.local.set({
      yeetProgress: { status: YeetProgressStatus.DONE },
    });
    browser.runtime.sendMessage({ action: BackgroundAction.CLOSE_TAB });
  }, 5000);

  const messageListener = (event: MessageEvent) => {
    if (event.data?.type === "YEET_POST_SUCCESS" && event.data.permalink) {
      console.log(
        "[Yeet] Received post URL from interceptor:",
        event.data.permalink,
      );
      window.removeEventListener("message", messageListener);
      clearTimeout(fallbackTimer);

      browser.storage.local.get(["lastYeet"]).then((res) => {
        browser.storage.local.set({
          ...(res.lastYeet
            ? { lastYeet: { ...res.lastYeet, postUrl: event.data.permalink } }
            : {}),
          yeetProgress: { status: YeetProgressStatus.DONE },
        });
        console.log("[Yeet] Closing tab.");
        browser.runtime.sendMessage({ action: BackgroundAction.CLOSE_TAB });
      });
    }
  };

  window.addEventListener("message", messageListener);
}

export async function handleThreadsAutoPost(selectors: SelectorsConfig) {
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.get("yeet_auto_post")) return;

  console.log("[Yeet] Auto-posting on Threads intent page...");

  const observer = new MutationObserver((_, obs) => {
    const buttons = Array.from(
      document.querySelectorAll(selectors.threads.postButton),
    );
    const postButton = buttons.find(
      (btn) => btn.textContent?.toLowerCase().trim() === "post",
    ) as HTMLElement;

    if (postButton && !postButton.getAttribute("aria-disabled")) {
      console.log("[Yeet] Found Threads Post button, proceeding.");
      obs.disconnect();
      clickAndPost(postButton, selectors);
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

async function clickAndPost(
  postButton: HTMLElement,
  selectors: SelectorsConfig,
): Promise<void> {
  const storage = await browser.storage.local.get(["copyImages"]);

  if (storage.copyImages !== false) {
    await injectPendingImages(selectors);
  }

  setupPostSuccessListener();
  postButton.click();
}
