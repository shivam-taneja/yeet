/** window.postMessage types between isolated Threads script ↔ MAIN world. */
export const YeetPageMessage = {
  INJECT_TEXT: "YEET_INJECT_TEXT",
  INJECT_DONE: "YEET_INJECT_DONE",
  POST_SUCCESS: "YEET_POST_SUCCESS",
} as const;

export type YeetInjectTextMessage = {
  type: typeof YeetPageMessage.INJECT_TEXT;
  requestId: string;
  text: string;
  composerSelector: string;
};

export type YeetInjectDoneMessage = {
  type: typeof YeetPageMessage.INJECT_DONE;
  requestId: string;
  ok: boolean;
  liveText?: string;
};

export type YeetPostSuccessMessage = {
  type: typeof YeetPageMessage.POST_SUCCESS;
  permalink?: string;
  postId?: string;
};
