import {
  YeetPageMessage,
  type YeetAttachImagesMessage,
  type YeetInjectTextMessage,
} from "@/lib/cross-post/messages";
import { fileFromDataUrl } from "@/lib/cross-post/data-url-file";
import {
  injectTextViaDraft,
  readDraftPlainText,
} from "@/lib/threads-to-x/main/inject-text";
import { attachImagesToXComposer } from "@/lib/threads-to-x/attach-media";
import { installCreateTweetWatcher } from "@/lib/threads-to-x/main/watch-post-api";

function listenForInjectRequests(): void {
  window.addEventListener("message", (event: MessageEvent) => {
    if (event.source !== window) return;
    const data = event.data as YeetInjectTextMessage | undefined;
    if (data?.type !== YeetPageMessage.INJECT_TEXT) return;

    const { text, composerSelector, requestId } = data;

    void injectTextViaDraft(composerSelector, text).then((ok) => {
      window.postMessage(
        {
          type: YeetPageMessage.INJECT_DONE,
          requestId,
          ok,
          liveText: readDraftPlainText(composerSelector),
        },
        "*",
      );
    });
  });
}

function listenForAttachRequests(): void {
  window.addEventListener("message", (event: MessageEvent) => {
    if (event.source !== window) return;
    const data = event.data as YeetAttachImagesMessage | undefined;
    if (data?.type !== YeetPageMessage.ATTACH_IMAGES) return;

    const { images, composerSelector, requestId } = data;

    try {
      const files = (images ?? []).map((img) =>
        fileFromDataUrl(img.name, img.mimeType, img.dataUrl),
      );
      const mediaInserted = attachImagesToXComposer(composerSelector, files);
      window.postMessage(
        {
          type: YeetPageMessage.ATTACH_DONE,
          requestId,
          ok: mediaInserted > 0,
          mediaInserted,
        },
        "*",
      );
    } catch (err) {
      console.error("[Yeet] Attach images failed:", err);
      window.postMessage(
        {
          type: YeetPageMessage.ATTACH_DONE,
          requestId,
          ok: false,
          mediaInserted: 0,
        },
        "*",
      );
    }
  });
}

/** MAIN-world bootstrap on X: Draft inject + media attach + CreateTweet watcher. */
export function installXMainWorld(): void {
  console.log("[Yeet] X MAIN world ready.");
  listenForInjectRequests();
  listenForAttachRequests();
  installCreateTweetWatcher();
}
