import { browser } from "wxt/browser";
import { clearPendingText } from "@/lib/cross-post/pending-text";
import {
  YeetPageMessage,
  type YeetPostSuccessMessage,
} from "@/lib/cross-post/messages";
import { YeetProgressStatus } from "@/types/settings";
import { BackgroundAction } from "@/types/messaging";

export function listenForPostSuccess(): void {
  const messageListener = (event: MessageEvent) => {
    if (event.source !== window) return;
    const data = event.data as YeetPostSuccessMessage | undefined;
    if (data?.type !== YeetPageMessage.POST_SUCCESS) return;

    const { permalink, postId } = data;
    if (!permalink && !postId) return;

    console.log("[Yeet] Post success intercepted:", { permalink, postId });
    window.removeEventListener("message", messageListener);

    void clearPendingText();

    browser.storage.local.get(["lastYeet"]).then((res) => {
      const lastYeet = res.lastYeet
        ? {
            ...res.lastYeet,
            ...(permalink ? { postUrl: permalink } : {}),
            ...(postId ? { postId } : {}),
          }
        : null;

      browser.storage.local.set({
        ...(lastYeet ? { lastYeet } : {}),
        yeetProgress: { status: YeetProgressStatus.DONE },
      });

      console.log("[Yeet] Closing tab.");
      browser.runtime.sendMessage({ action: BackgroundAction.CLOSE_TAB });
    });
  };

  window.addEventListener("message", messageListener);
}
