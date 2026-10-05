import { browser } from "wxt/browser";
import { extractTextFromDraftEditor } from "@/lib/dom-utils";
import { savePendingText } from "@/lib/x-to-threads/pending-text";
import type { AppSettings } from "@/types/settings";
import { YeetProgressStatus } from "@/types/settings";
import { getComposerContext, defaultXContexts } from "@/lib/x/context";
import type { SelectorsConfig } from "@/types/selectors";
import { BackgroundAction } from "@/types/messaging";

/** Blank Threads composer — text comes from storage, not the URL. */
export const THREADS_AUTO_POST_URL =
  "https://www.threads.com/intent/post?yeet_auto_post=true";

/**
 * Step 1 — On X: capture composer text, stash it, open Threads in the background.
 */
export async function captureFromX(
  e: Event | null,
  selectors: SelectorsConfig,
): Promise<void> {
  const storage = await browser.storage.local.get(["isActive", "xContexts"]);
  if (storage.isActive === false) return;

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

  const ctx = getComposerContext(editorElement);
  const xContexts = (storage.xContexts ??
    defaultXContexts) as AppSettings["xContexts"];

  if (ctx === "unknown" || !xContexts[ctx]) {
    console.log(`[Yeet] Skipping — context "${ctx}" is not enabled.`);
    return;
  }

  const text = extractTextFromDraftEditor(editorElement) || "";

  if (!text) {
    console.log("[Yeet] No text found to cross-post.");
    return;
  }

  if (text.length > 500) {
    alert(
      "Yeet failed: Threads only supports up to 500 characters per post! Your post is too big to Yeet.",
    );
    return;
  }

  console.log("[Yeet] Extracted text:", text);

  await savePendingText(text);

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
      "[Yeet] 🛠️ DEV MODE — skipping Threads tab. Pending text saved; would open:",
      THREADS_AUTO_POST_URL,
    );
    return;
  }

  browser.runtime.sendMessage({
    action: BackgroundAction.OPEN_BACKGROUND_TAB,
    url: THREADS_AUTO_POST_URL,
  });
}
