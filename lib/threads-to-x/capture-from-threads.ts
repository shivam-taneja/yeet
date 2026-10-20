import { browser } from "wxt/browser";
import { extractTextFromLexicalEditor } from "@/lib/dom-utils";
import { savePendingText, clearPendingText } from "@/lib/cross-post/pending-text";
import {
  savePendingImages,
  clearPendingImages,
  MAX_X_IMAGES,
} from "@/lib/cross-post/pending-images";
import {
  snapshotThreadsComposerImageSrcs,
  filesFromImageSrcs,
  threadsComposerHasUnsupportedMedia,
  findThreadsComposerRoot,
  findThreadsComposerMediaRoots,
} from "@/lib/threads-to-x/capture-images";
import {
  awaitWarmCachedImages,
  clearWarmImageCache,
} from "@/lib/threads-to-x/warm-image-cache";
import { markYeetHandoff } from "@/lib/cross-post/yeet-handoff";
import type { AppSettings } from "@/types/settings";
import { YeetProgressStatus } from "@/types/settings";
import {
  getThreadsComposerContext,
  defaultThreadsContexts,
} from "@/lib/threads/context";
import { getLastActiveThreadsComposer } from "@/lib/threads/active-composer";
import {
  findComposersNearPostButton,
  findThreadsPostSubmitFromEvent,
} from "@/lib/threads/post-button";
import type { SelectorsConfig } from "@/types/selectors";
import { BackgroundAction } from "@/types/messaging";

/** Blank X intent — body text/images come from storage, not the URL. */
export const X_AUTO_POST_URL = "https://x.com/intent/post?yeet_auto_post=true";

function composerHasMediaPreview(composer: Element): boolean {
  const root = findThreadsComposerRoot(composer);
  return snapshotThreadsComposerImageSrcs(root).length > 0;
}

function pickBestComposer(candidates: Element[]): Element | null {
  if (candidates.length === 0) return null;

  const withText = candidates.filter(
    (el) => extractTextFromLexicalEditor(el).length > 0,
  );
  if (withText.length > 0) {
    return withText[withText.length - 1] ?? null;
  }

  const withMedia = candidates.filter((el) => composerHasMediaPreview(el));
  if (withMedia.length > 0) {
    return withMedia[withMedia.length - 1] ?? null;
  }

  return candidates[candidates.length - 1] ?? null;
}

function findActiveComposer(
  e: Event | null,
  selectors: SelectorsConfig,
): Element | null {
  const last = getLastActiveThreadsComposer();
  if (
    last &&
    (extractTextFromLexicalEditor(last).length > 0 ||
      composerHasMediaPreview(last))
  ) {
    return last;
  }

  if (e?.target instanceof Element) {
    const fromTarget = e.target.closest(selectors.threads.composer);
    if (
      fromTarget &&
      (extractTextFromLexicalEditor(fromTarget).length > 0 ||
        composerHasMediaPreview(fromTarget))
    ) {
      return fromTarget;
    }

    const submit = findThreadsPostSubmitFromEvent(e.target, selectors);
    if (submit) {
      const near = findComposersNearPostButton(
        submit,
        selectors.threads.composer,
      );
      const best = pickBestComposer(near);
      if (best) return best;
    }

    const dialog = e.target.closest('[role="dialog"]');
    if (dialog) {
      const best = pickBestComposer(
        Array.from(dialog.querySelectorAll(selectors.threads.composer)),
      );
      if (best) return best;
    }
  }

  return pickBestComposer(
    Array.from(document.querySelectorAll(selectors.threads.composer)),
  );
}

/**
 * Snapshot composer state synchronously — Threads clears the editor as soon as
 * Post is pressed, so we must not await storage before reading text/media.
 */
function snapshotComposer(
  e: Event | null,
  selectors: SelectorsConfig,
): {
  text: string;
  ctx: ReturnType<typeof getThreadsComposerContext>;
  editorElement: Element | null;
  container: ParentNode;
  hasUnsupportedMedia: boolean;
  liveSrcs: string[];
} {
  const editorElement = findActiveComposer(e, selectors);
  const dialog = editorElement?.closest('[role="dialog"], dialog') ?? null;
  const mediaRoots = findThreadsComposerMediaRoots(selectors.threads.composer);
  const container: ParentNode =
    dialog ||
    (editorElement ? findThreadsComposerRoot(editorElement) : null) ||
    mediaRoots.find((r) => editorElement && r.contains(editorElement)) ||
    mediaRoots[0] ||
    editorElement?.parentElement ||
    document.body;

  const hasUnsupportedMedia = threadsComposerHasUnsupportedMedia(container);
  return {
    text: extractTextFromLexicalEditor(editorElement) || "",
    ctx: getThreadsComposerContext(editorElement),
    editorElement,
    container,
    hasUnsupportedMedia,
    liveSrcs: hasUnsupportedMedia
      ? []
      : snapshotThreadsComposerImageSrcs(container),
  };
}

/** On Threads: capture composer text (+ images), stash, open X in the background. */
export async function captureFromThreads(
  e: Event | null,
  selectors: SelectorsConfig,
): Promise<void> {
  // CRITICAL: read before any await — native Post clears the composer.
  const { text, ctx, hasUnsupportedMedia, liveSrcs } = snapshotComposer(
    e,
    selectors,
  );

  const storage = await browser.storage.local.get([
    "isActive",
    "threadsContexts",
    "copyImages",
  ]);
  if (storage.isActive === false) return;

  console.log("[Yeet] copyImages setting:", storage.copyImages);

  const threadsContexts = (storage.threadsContexts ??
    defaultThreadsContexts) as AppSettings["threadsContexts"];

  if (ctx === "unknown" || !threadsContexts[ctx]) {
    console.log(`[Yeet] Skipping — context "${ctx}" is not enabled.`);
    return;
  }

  if (hasUnsupportedMedia) {
    clearWarmImageCache();
    console.warn(
      "[Yeet] Skipping yeet — Threads composer has video/GIF (not supported yet).",
    );
    alert(
      "Yeet skipped: videos and GIFs aren’t supported yet. Your post on Threads still went through.",
    );
    return;
  }

  let imageFiles: File[] = [];
  if (storage.copyImages === true) {
    imageFiles = await awaitWarmCachedImages(1000);
    if (imageFiles.length === 0 && liveSrcs.length > 0) {
      imageFiles = await filesFromImageSrcs(liveSrcs);
    }
    if (imageFiles.length === 0) {
      console.warn(
        "[Yeet] copyImages ON but warm cache empty and no live srcs — text only.",
      );
    }

    if (imageFiles.length > MAX_X_IMAGES) {
      console.warn(
        `[Yeet] Capping images to ${MAX_X_IMAGES} (X limit).`,
      );
      imageFiles = imageFiles.slice(0, MAX_X_IMAGES);
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
      platform: "X",
    },
    yeetProgress: { status: YeetProgressStatus.YEETING },
  });

  if (import.meta.env.VITE_DEV_MODE === "true") {
    console.log(
      "[Yeet] DEV MODE — skipping X tab. Pending saved; would open:",
      X_AUTO_POST_URL,
      "(background)",
    );
    return;
  }

  browser.runtime.sendMessage({
    action: BackgroundAction.OPEN_BACKGROUND_TAB,
    url: X_AUTO_POST_URL,
    active: false,
  });
}
