// XContext = every actionable composer context (excludes "unknown")
export type XContext =
  | "new-post"
  | "mention-post"
  | "quote"
  | "reply"
  | "thread";

// ComposerContext = XContext + the unrecognised fallback
export type ComposerContext = XContext | "unknown";

/** Threads composer contexts (no profile mention-post on Threads). */
export type ThreadsContext = Exclude<XContext, "mention-post">;

export enum YeetProgressStatus {
  IDLE = "idle",
  YEETING = "yeeting",
  DONE = "done",
  ERROR = "error",
}

export interface AppSettings {
  copyImages: boolean;
  copyVideos: boolean;
  copyGifs: boolean;
  isActive: boolean;
  xContexts: Record<XContext, boolean>;
  threadsContexts: Record<ThreadsContext, boolean>;
  lastSavedAt: number | null;
  lastYeet: {
    text: string;
    timestamp: number;
    platform: "X" | "Threads";
    postUrl?: string;
    postId?: string;
  } | null;
  yeetProgress?: {
    status: YeetProgressStatus;
    /** True when images were attached and we're waiting for the user to Post. */
    awaitingManualPost?: boolean;
  } | null;
}
