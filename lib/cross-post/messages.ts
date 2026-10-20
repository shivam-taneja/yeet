/** window.postMessage types between isolated content scripts ↔ MAIN world. */
export const YeetPageMessage = {
  INJECT_TEXT: "YEET_INJECT_TEXT",
  INJECT_DONE: "YEET_INJECT_DONE",
  ATTACH_IMAGES: "YEET_ATTACH_IMAGES",
  ATTACH_DONE: "YEET_ATTACH_DONE",
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

/** Serializable image payloads for MAIN-world attach (no fetch(data:…)). */
export type YeetAttachImagePayload = {
  name: string;
  mimeType: string;
  dataUrl: string;
};

export type YeetAttachImagesMessage = {
  type: typeof YeetPageMessage.ATTACH_IMAGES;
  requestId: string;
  composerSelector: string;
  images: YeetAttachImagePayload[];
};

export type YeetAttachDoneMessage = {
  type: typeof YeetPageMessage.ATTACH_DONE;
  requestId: string;
  ok: boolean;
  mediaInserted: number;
};

export type YeetPostSuccessMessage = {
  type: typeof YeetPageMessage.POST_SUCCESS;
  permalink?: string;
  postId?: string;
};
