import {
  YeetPageMessage,
  type YeetInjectTextMessage,
} from "@/lib/cross-post/messages";
import {
  injectTextViaDraft,
  readDraftPlainText,
} from "@/lib/threads-to-x/main/inject-text";
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

/** MAIN-world bootstrap on X: Draft inject + CreateTweet watcher. */
export function installXMainWorld(): void {
  console.log("[Yeet] X MAIN world ready.");
  listenForInjectRequests();
  installCreateTweetWatcher();
}
