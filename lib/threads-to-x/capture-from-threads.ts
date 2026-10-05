import { browser } from "wxt/browser";
import { extractTextFromLexicalEditor } from "@/lib/dom-utils";
import { savePendingText } from "@/lib/cross-post/pending-text";
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

/** Blank X intent — body text comes from storage, not the URL. */
export const X_AUTO_POST_URL = "https://x.com/intent/post?yeet_auto_post=true";

function pickBestComposer(candidates: Element[]): Element | null {
  if (candidates.length === 0) return null;

  const withText = candidates.filter(
    (el) => extractTextFromLexicalEditor(el).length > 0,
  );
  if (withText.length > 0) {
    return withText[withText.length - 1] ?? null;
  }

  return candidates[candidates.length - 1] ?? null;
}

function findActiveComposer(
  e: Event | null,
  selectors: SelectorsConfig,
): Element | null {
  const last = getLastActiveThreadsComposer();
  if (last && extractTextFromLexicalEditor(last).length > 0) {
    return last;
  }

  if (e?.target instanceof Element) {
    const fromTarget = e.target.closest(selectors.threads.composer);
    if (fromTarget && extractTextFromLexicalEditor(fromTarget).length > 0) {
      return fromTarget;
    }

    const submit = findThreadsPostSubmitFromEvent(e.target, selectors);
    if (submit) {
      const near = findComposersNearPostButton(
        submit,
        selectors.threads.composer,
      );
      const best = pickBestComposer(near);
      if (best && extractTextFromLexicalEditor(best).length > 0) return best;
    }

    const dialog = e.target.closest('[role="dialog"]');
    if (dialog) {
      const best = pickBestComposer(
        Array.from(dialog.querySelectorAll(selectors.threads.composer)),
      );
      if (best && extractTextFromLexicalEditor(best).length > 0) return best;
    }
  }

  return pickBestComposer(
    Array.from(document.querySelectorAll(selectors.threads.composer)),
  );
}

/**
 * Snapshot composer state synchronously — Threads clears the editor as soon as
 * Post is pressed, so we must not await storage before reading text.
 */
function snapshotComposer(
  e: Event | null,
  selectors: SelectorsConfig,
): { text: string; ctx: ReturnType<typeof getThreadsComposerContext> } {
  const editorElement = findActiveComposer(e, selectors);
  return {
    text: extractTextFromLexicalEditor(editorElement) || "",
    ctx: getThreadsComposerContext(editorElement),
  };
}

/** On Threads: capture composer text, stash it, open X in the background. */
export async function captureFromThreads(
  e: Event | null,
  selectors: SelectorsConfig,
): Promise<void> {
  // CRITICAL: read text before any await — native Post clears the composer.
  const { text, ctx } = snapshotComposer(e, selectors);

  const storage = await browser.storage.local.get([
    "isActive",
    "threadsContexts",
  ]);
  if (storage.isActive === false) return;

  const threadsContexts = (storage.threadsContexts ??
    defaultThreadsContexts) as AppSettings["threadsContexts"];

  if (ctx === "unknown" || !threadsContexts[ctx]) {
    console.log(`[Yeet] Skipping — context "${ctx}" is not enabled.`);
    return;
  }

  if (!text) {
    console.log("[Yeet] No text found to cross-post.");
    return;
  }

  console.log("[Yeet] Extracted text:", text);

  await savePendingText(text);

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
      "[Yeet] DEV MODE — skipping X tab. Pending text saved; would open:",
      X_AUTO_POST_URL,
    );
    return;
  }

  browser.runtime.sendMessage({
    action: BackgroundAction.OPEN_BACKGROUND_TAB,
    url: X_AUTO_POST_URL,
  });
}
