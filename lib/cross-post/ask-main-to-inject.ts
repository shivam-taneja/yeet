import {
  YeetPageMessage,
  type YeetInjectDoneMessage,
} from "@/lib/cross-post/messages";

/** Ask page MAIN world to inject text into the destination composer. */
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
