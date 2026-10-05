import {
  YeetPageMessage,
  type YeetInjectTextMessage,
} from "@/lib/x-to-threads/messages";
import {
  injectTextViaLexical,
  readLexicalPlainText,
} from "@/lib/x-to-threads/main/inject-text";
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

/** MAIN-world bootstrap: Lexical inject + post API watcher. */
export function installThreadsMainWorld(): void {
  console.log("[Yeet] MAIN world ready.");
  listenForInjectRequests();
  installPostApiWatcher();
}
