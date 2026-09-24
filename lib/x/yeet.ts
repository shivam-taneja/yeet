import { browser } from "wxt/browser";
import { savePendingMedia } from "@/lib/media-storage";
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
  const storage = await browser.storage.local.get([
    "isActive",
    "xContexts",
    "copyImages",
  ]);
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

  if (text.length > 500) {
    alert(
      "Yeet failed: Threads only supports up to 500 characters per post! Your post is too big to Yeet.",
    );
    return;
  }

  // --- IMAGE EXTRACTION LOGIC ---
  let hasMedia = false;
  if (storage.copyImages !== false) {
    const container = editorElement?.closest('[role="dialog"]') || document;
    const attachmentImages = Array.from(
      container.querySelectorAll('[data-testid="attachments"] img'),
    ) as HTMLImageElement[];

    // Warn if there are videos/gifs attached (not supported yet)
    const hasUnsupported =
      container.querySelectorAll(
        '[data-testid="attachments"] video, [data-testid="attachments"] [data-testid="gif"]',
      ).length > 0;

    if (hasUnsupported) {
      alert(
        "Yeet: Videos and GIFs aren't supported yet — only images will be copied to Threads.",
      );
    }

    if (attachmentImages.length > 0) {
      console.log(`[Yeet] Found ${attachmentImages.length} attached images!`);
      const files: File[] = [];

      for (let i = 0; i < attachmentImages.length; i++) {
        const img = attachmentImages[i];
        if (!img) continue;

        if (img.src && img.src.startsWith("blob:")) {
          try {
            const res = await fetch(img.src);
            const blob = await res.blob();

            if (!blob.type.startsWith("image/")) {
              console.warn(`[Yeet] Skipping non-image blob: ${blob.type}`);
              continue;
            }

            const ext = blob.type.split("/")[1] || "jpg";
            files.push(
              new File([blob], `yeet_image_${i}.${ext}`, { type: blob.type }),
            );
          } catch (err) {
            console.error("[Yeet] Failed to fetch blob image:", err);
          }
        }
      }

      if (files.length > 0) {
        await savePendingMedia(files);
        console.log("[Yeet] Successfully saved images to storage.");
        hasMedia = true;
      }
    }
  }
  // ------------------------------

  if (!text && !hasMedia) {
    console.log("[Yeet] No text or media found to cross-post.");
    return;
  }

  console.log("[Yeet] Extracted text:", text, "| Has Media:", hasMedia);
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
    hasMedia,
  });
}
