import { browser } from "wxt/browser";
import { extractTextFromLexicalEditor } from "@/lib/dom-utils";
import type { AppSettings } from "@/types/settings";
import type { FALLBACK_SELECTORS } from "@/lib/constants";
import {
  getThreadsComposerContext,
  defaultThreadsContexts,
} from "@/lib/threads/context";

export async function doYeetToX(
  e: Event | null,
  selectors: typeof FALLBACK_SELECTORS,
): Promise<void> {
  const storage = await browser.storage.local.get([
    "isActive",
    "threadsContexts",
  ]);
  if (storage.isActive === false) return;

  // Find the active editor by finding all composers and picking the one that has text.
  // This bypasses the complex obfuscated DOM tree.
  const target = e?.target as HTMLElement | undefined;
  let editorElement: Element | null =
    target?.closest(selectors.threads.composer) || null;

  if (!editorElement) {
    const allComposers = Array.from(
      document.querySelectorAll(selectors.threads.composer),
    );
    editorElement = (allComposers.find(
      (c) => extractTextFromLexicalEditor(c) !== "",
    ) ||
      allComposers[0] ||
      null) as Element | null;
  }

  const context = getThreadsComposerContext(editorElement);

  // Read settings, fallback to defaults
  const settingsContexts =
    (storage.threadsContexts as AppSettings["threadsContexts"]) ||
    defaultThreadsContexts;

  console.log(`[Yeet] Detected Threads context: ${context}`);

  // Check if context is enabled
  if (context !== "unknown" && !settingsContexts[context]) {
    console.log(`[Yeet] Skipping — context "${context}" is not enabled.`);
    return;
  }

  const text = extractTextFromLexicalEditor(editorElement);
  if (!text) {
    console.log("[Yeet] No text found to cross-post.");
    return;
  }

  if (text.length > 280) {
    alert(
      "Yeet failed: X only supports up to 280 characters for standard posts! Your post is too big to Yeet.",
    );
    return;
  }

  console.log("[Yeet] Extracted text from Threads:", text);
  const encodedText = encodeURIComponent(text);
  const url = `https://x.com/intent/tweet?text=${encodedText}&yeet_auto_post=true`;

  browser.storage.local.set({
    lastYeet: {
      text,
      timestamp: Date.now(),
      platform: "X",
    },
  });

  if (import.meta.env.VITE_DEV_MODE === "true") {
    console.log(
      "[Yeet] 🛠️ DEV MODE — skipping actual cross-post to X. Would have opened:",
      url,
    );
    return;
  }

  browser.runtime.sendMessage({ action: "openBackgroundTab", url });
}
