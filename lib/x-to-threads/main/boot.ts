import {
  YeetPageMessage,
  type YeetAttachImagesMessage,
  type YeetInjectTextMessage,
} from "@/lib/cross-post/messages";
import { fileFromDataUrl } from "@/lib/cross-post/data-url-file";
import {
  injectTextViaLexical,
  readLexicalPlainText,
} from "@/lib/x-to-threads/main/inject-text";
import { attachImagesToThreadsComposer } from "@/lib/x-to-threads/attach-media";
import { installPostApiWatcher } from "@/lib/x-to-threads/main/watch-post-api";

function listenForInjectRequests(): void {
  window.addEventListener("message", (event: MessageEvent) => {
    if (event.source !== window) return;
    const data = event.data as YeetInjectTextMessage | undefined;
    if (data?.type !== YeetPageMessage.INJECT_TEXT) return;

    const { text, composerSelector, requestId } = data;

    void injectTextViaLexical(composerSelector, text).then((ok) => {
      const el = document.querySelector(composerSelector) as HTMLElement | null;
      window.postMessage(
        {
          type: YeetPageMessage.INJECT_DONE,
          requestId,
          ok,
          liveText: el ? readLexicalPlainText(el) : "",
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
      const mediaInserted = attachImagesToThreadsComposer(
        composerSelector,
        files,
      );
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

/** MAIN-world bootstrap: Lexical inject + media attach + post API watcher. */
export function installThreadsMainWorld(): void {
  console.log("[Yeet] MAIN world ready.");
  listenForInjectRequests();
  listenForAttachRequests();
  installPostApiWatcher();
}
