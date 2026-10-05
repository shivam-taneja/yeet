import { browser } from "wxt/browser";
import { extractTextFromLexicalEditor } from "@/lib/dom-utils";
import { savePendingText } from "@/lib/cross-post/pending-text";
import type { AppSettings } from "@/types/settings";
import { YeetProgressStatus } from "@/types/settings";
import {
  getThreadsComposerContext,
  defaultThreadsContexts,
} from "@/lib/threads/context";
import type { SelectorsConfig } from "@/types/selectors";
import { BackgroundAction } from "@/types/messaging";

/** Blank X intent — body text comes from storage, not the URL. */
export const X_AUTO_POST_URL = "https://x.com/intent/post?yeet_auto_post=true";

function findActiveComposer(
  e: Event | null,
  selectors: SelectorsConfig,
): Element | null {
  if (e?.target instanceof Element) {
    const dialog = e.target.closest('[role="dialog"]');
    if (dialog) {
      const inDialog = dialog.querySelector(selectors.threads.composer);
      if (inDialog) return inDialog;
    }
    const fromTarget = e.target.closest(selectors.threads.composer);
    if (fromTarget) return fromTarget;
  }

  const all = Array.from(document.querySelectorAll(selectors.threads.composer));
  return (
    all.find((el) => {
      const text = extractTextFromLexicalEditor(el);
      return text.length > 0;
    }) ||
    all.find((el) => el.closest('[role="dialog"]')) ||
    all[0] ||
    null
  );
}

/** On Threads: capture composer text, stash it, open X in the background. */
export async function captureFromThreads(
  e: Event | null,
  selectors: SelectorsConfig,
): Promise<void> {
  const storage = await browser.storage.local.get([
    "isActive",
    "threadsContexts",
  ]);
  if (storage.isActive === false) return;

  const editorElement = findActiveComposer(e, selectors);
  const ctx = getThreadsComposerContext(editorElement);
  const threadsContexts = (storage.threadsContexts ??
    defaultThreadsContexts) as AppSettings["threadsContexts"];

  if (ctx === "unknown" || !threadsContexts[ctx]) {
    console.log(`[Yeet] Skipping — context "${ctx}" is not enabled.`);
    return;
  }

  const text = extractTextFromLexicalEditor(editorElement) || "";

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
