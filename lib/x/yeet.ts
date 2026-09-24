import { browser } from "wxt/browser";
import { extractTextFromDraftEditor } from "@/lib/dom-utils";
import type { AppSettings } from "@/types/settings";
import { YeetProgressStatus } from "@/types/settings";
import { getComposerContext, defaultXContexts } from "@/lib/x/context";
import type { SelectorsConfig } from "@/types/selectors";
import { BackgroundAction } from "@/types/messaging";

export async function doYeet(
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

  const text = extractTextFromDraftEditor(editorElement);

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
  const encodedText = encodeURIComponent(text);
  const url = `https://www.threads.com/intent/post?text=${encodedText}&yeet_auto_post=true`;

  browser.storage.local.set({
    lastYeet: {
      text,
      timestamp: Date.now(),
      platform: "Threads",
    },
    yeetProgress: { status: YeetProgressStatus.YEETING },
  });

  if (import.meta.env.VITE_DEV_MODE === "true") {
    console.log(
      "[Yeet] 🛠️ DEV MODE — skipping actual cross-post to Threads. Would have opened:",
      url,
    );
    return;
  }

  browser.runtime.sendMessage({
    action: BackgroundAction.OPEN_BACKGROUND_TAB,
    url,
  });
}
