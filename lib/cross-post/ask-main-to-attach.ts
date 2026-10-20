import {
  YeetPageMessage,
  type YeetAttachDoneMessage,
  type YeetAttachImagePayload,
} from "@/lib/cross-post/messages";

/** Ask page MAIN world to attach images via the native file input. */
export function askMainWorldToAttachImages(
  images: YeetAttachImagePayload[],
  composerSelector: string,
): Promise<{ ok: boolean; mediaInserted: number }> {
  const requestId = `yeet-attach-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return new Promise((resolve) => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      const data = event.data as YeetAttachDoneMessage | undefined;
      if (data?.type !== YeetPageMessage.ATTACH_DONE) return;
      if (data.requestId !== requestId) return;

      window.removeEventListener("message", onMessage);
      console.log("[Yeet] MAIN attach done:", data);
      resolve({
        ok: Boolean(data.ok),
        mediaInserted: Number(data.mediaInserted) || 0,
      });
    };

    window.addEventListener("message", onMessage);
    window.postMessage(
      {
        type: YeetPageMessage.ATTACH_IMAGES,
        requestId,
        composerSelector,
        images,
      },
      "*",
    );
  });
}
