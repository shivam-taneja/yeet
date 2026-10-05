import type { AppSettings } from "@/types/settings";
import { YeetProgressStatus } from "@/types/settings";

export const DEFAULT_APP_SETTINGS: AppSettings = {
  copyImages: false,
  copyVideos: false,
  copyGifs: false,
  isActive: true,
  xContexts: {
    "new-post": true,
    "mention-post": false,
    quote: false,
    reply: false,
    thread: false,
  },
  threadsContexts: {
    "new-post": true,
    quote: false,
    reply: false,
    thread: false,
  },
  lastSavedAt: null,
  lastYeet: null,
  yeetProgress: { status: YeetProgressStatus.IDLE },
};

export const APP_SETTINGS_STORAGE_KEYS = Object.keys(
  DEFAULT_APP_SETTINGS,
) as Array<keyof AppSettings>;
