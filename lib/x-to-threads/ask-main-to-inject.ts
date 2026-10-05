import {
  YeetPageMessage,
  type YeetInjectDoneMessage,
} from "@/lib/x-to-threads/messages";

/**
 * Ask the MAIN-world script to inject text via Lexical setEditorState.
 * (Isolated world cannot drive Lexical reliably.)
 */
export function askMainWorldToInject(
  text: string,
  composerSelector: string,
): Promise<boolean> {
  const requestId = `yeet-inject-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return new Promise((resolve) => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      const data = event.data as YeetInjectDoneMessage | undefined;
      if (data?.type !== YeetPageMessage.INJECT_DONE) return;
      if (data.requestId !== requestId) return;

      window.removeEventListener("message", onMessage);
      console.log("[Yeet] MAIN inject done:", data);
      resolve(Boolean(data.ok));
    };

    window.addEventListener("message", onMessage);
    window.postMessage(
      {
        type: YeetPageMessage.INJECT_TEXT,
        requestId,
        text,
        composerSelector,
      },
      "*",
    );
  });
}
