import { browser } from "wxt/browser";
import { extractTextFromDraftEditor } from "@/lib/dom-utils";
import { savePendingText, clearPendingText } from "@/lib/cross-post/pending-text";
import {
  savePendingImages,
  clearPendingImages,
  MAX_PENDING_IMAGES,
} from "@/lib/cross-post/pending-images";
import {
  snapshotXComposerImageSrcs,
  filesFromImageSrcs,
  xComposerHasUnsupportedMedia,
  findXComposerMediaRoots,
} from "@/lib/x-to-threads/capture-images";
import {
  awaitWarmCachedImages,
  clearWarmImageCache,
} from "@/lib/x-to-threads/warm-image-cache";
import { markYeetHandoff } from "@/lib/cross-post/yeet-handoff";
import {
  CHARACTER_LIMITS,
  formatOverLimitMessage,
} from "@/lib/character-limits";
import type { AppSettings } from "@/types/settings";
import { YeetProgressStatus } from "@/types/settings";
import { getComposerContext, defaultXContexts } from "@/lib/x/context";
import type { SelectorsConfig } from "@/types/selectors";
import { BackgroundAction } from "@/types/messaging";

/** Threads intent — body text/images come from storage, not the URL. */
export const THREADS_AUTO_POST_URL =
  "https://www.threads.com/intent/post?yeet_auto_post=true";

/** On X: capture composer text (+ images), stash, open Threads intent. */
export async function captureFromX(
  e: Event | null,
  selectors: SelectorsConfig,
): Promise<void> {
  // Sync before any await — X clears attachments / blob: URLs on Post.
  let editorElement: Element | null = null;
  if (e?.target instanceof Element) {
    const dialog = e.target.closest('[role="dialog"]');
    if (dialog) {
      editorElement = dialog.querySelector(selectors.x.composer);
    }
  }
  if (!editorElement) {
    const all = Array.from(document.querySelectorAll(selectors.x.composer));
    editorElement =
      all.find((el) => !el.closest('[role="dialog"]')) || all[0] || null;
  }

  const text = extractTextFromDraftEditor(editorElement) || "";
  // Prefer compose dialog / media roots — never bare `document` (feed media).
  const dialog = editorElement?.closest('[role="dialog"]') ?? null;
  const mediaRoots = findXComposerMediaRoots();
  const container: ParentNode =
    dialog ||
    mediaRoots.find((r) => editorElement && r.contains(editorElement)) ||
    mediaRoots[0] ||
    editorElement?.parentElement ||
    document.body;
  // Sync — composer media is cleared right after Post.
  const hasUnsupportedMedia = xComposerHasUnsupportedMedia(container);
  const liveSrcs = hasUnsupportedMedia
    ? []
    : snapshotXComposerImageSrcs(container);

  const storage = await browser.storage.local.get([
    "isActive",
    "xContexts",
    "copyImages",
  ]);
  if (storage.isActive === false) return;

  console.log("[Yeet] copyImages setting:", storage.copyImages);

  const ctx = getComposerContext(editorElement);
  const xContexts = (storage.xContexts ??
    defaultXContexts) as AppSettings["xContexts"];

  if (ctx === "unknown" || !xContexts[ctx]) {
    console.log(`[Yeet] Skipping — context "${ctx}" is not enabled.`);
    return;
  }

  if (hasUnsupportedMedia) {
    clearWarmImageCache();
    console.warn(
      "[Yeet] Skipping yeet — X composer has video/GIF (not supported yet).",
    );
    alert(
      "Yeet skipped: videos and GIFs aren’t supported yet. Your post on X still went through.",
    );
    return;
  }

  let imageFiles: File[] = [];
  if (storage.copyImages === true) {
    // Prefer warm cache — live blob: URLs are often already revoked at Post.
    imageFiles = await awaitWarmCachedImages(1000);
    if (imageFiles.length === 0 && liveSrcs.length > 0) {
      imageFiles = await filesFromImageSrcs(liveSrcs);
    }
    if (imageFiles.length === 0) {
      console.warn(
        "[Yeet] copyImages ON but warm cache empty and no live srcs — text only.",
      );
    }

    if (imageFiles.length > MAX_PENDING_IMAGES) {
      console.warn(
        `[Yeet] Capping images to ${MAX_PENDING_IMAGES} (Threads limit).`,
      );
      imageFiles = imageFiles.slice(0, MAX_PENDING_IMAGES);
    }
  } else if (liveSrcs.length > 0) {
    console.log(
      "[Yeet] Images present but Copy Images is OFF — enable it in Options.",
    );
  }

  if (!text && imageFiles.length === 0) {
    console.log("[Yeet] No text or images found to cross-post.");
    return;
  }

  if (text.length > CHARACTER_LIMITS.threads) {
    alert(formatOverLimitMessage("Threads", CHARACTER_LIMITS.threads));
    return;
  }

  const hasMedia = imageFiles.length > 0;
  console.log(
    "[Yeet] Extracted text:",
    text || "(none)",
    "| images:",
    imageFiles.length,
    "→ background intent",
  );

  await clearPendingText();
  await clearPendingImages();

  if (text) await savePendingText(text);
  if (imageFiles.length > 0) await savePendingImages(imageFiles);

  await markYeetHandoff(hasMedia ? "media" : "text");
  clearWarmImageCache();

  await browser.storage.local.set({
    lastYeet: {
      text,
      timestamp: Date.now(),
      platform: "Threads",
    },
    yeetProgress: { status: YeetProgressStatus.YEETING },
  });

  if (import.meta.env.VITE_DEV_MODE === "true") {
    console.log(
      "[Yeet] DEV MODE — skipping Threads tab. Pending saved; would open:",
      THREADS_AUTO_POST_URL,
      "(background)",
    );
    return;
  }

  browser.runtime.sendMessage({
    action: BackgroundAction.OPEN_BACKGROUND_TAB,
    url: THREADS_AUTO_POST_URL,
    // Text and images both stay in a background tab.
    active: false,
  });
}
