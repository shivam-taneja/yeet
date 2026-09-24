// XContext = every actionable composer context (excludes "unknown")
export type XContext =
  | "new-post"
  | "mention-post"
  | "quote"
  | "reply"
  | "thread";

// ComposerContext = XContext + the unrecognised fallback
export type ComposerContext = XContext | "unknown";

export enum YeetProgressStatus {
  IDLE = "idle",
  YEETING = "yeeting",
  DONE = "done",
  ERROR = "error",
}

export interface AppSettings {
  copyImages: boolean;
  isActive: boolean;
  xContexts: Record<XContext, boolean>;
  threadsContexts: Record<XContext, boolean>;
  lastSavedAt: number | null;
  lastYeet: {
    text: string;
    timestamp: number;
    platform: "X" | "Threads";
    postUrl?: string;
  } | null;
  yeetProgress?: {
    status: YeetProgressStatus;
  } | null;
}
