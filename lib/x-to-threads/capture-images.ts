import { MIN_IMAGE_BYTES } from "@/lib/cross-post/pending-images";

function extensionForMime(mime: string): string {
  const subtype = mime.split("/")[1]?.split(";")[0]?.toLowerCase();
  if (!subtype) return "jpg";
  if (subtype === "jpeg") return "jpg";
  return subtype;
}

/**
 * Snapshot attachment image URLs synchronously — X clears the composer
 * as soon as Post is pressed, so any await before reading srcs loses them.
 */
export function snapshotXComposerImageSrcs(container: ParentNode): string[] {
  const selectors = [
    '[data-testid="attachments"] img',
    '[data-testid="tweetPhoto"] img',
    'div[data-testid="attachments"] img',
    'img[src^="blob:"]',
  ];

  const imgs = Array.from(
    container.querySelectorAll(selectors.join(", ")),
  ) as HTMLImageElement[];

  const srcs: string[] = [];
  const seen = new Set<string>();

  for (const img of imgs) {
    if (
      img.closest('[data-testid="videoComponent"], [data-testid="videoPlayer"]')
    ) {
      continue;
    }
    const inAttachments = Boolean(
      img.closest(
        '[data-testid="attachments"], [data-testid="tweetPhoto"], [aria-label*="Image" i]',
      ),
    );
    const src = img.currentSrc || img.src || "";
    if (!src || seen.has(src)) continue;
    if (!src.startsWith("blob:") && !inAttachments) continue;

    seen.add(src);
    srcs.push(src);
  }

  console.log(
    `[Yeet] Image src snapshot: ${srcs.length}`,
    srcs.map((s) => s.slice(0, 48)),
  );
  return srcs;
}

/** Fetch Files from srcs that were snapshotted before any await. */
export async function filesFromImageSrcs(srcs: string[]): Promise<File[]> {
  const blobSrcs = srcs.filter((s) => s.startsWith("blob:"));
  const candidates = blobSrcs.length > 0 ? blobSrcs : srcs;
  const files: File[] = [];

  for (let i = 0; i < candidates.length; i++) {
    const src = candidates[i];
    if (!src) continue;

    try {
      const res = await fetch(src);
      const blob = await res.blob();
      if (blob.type && !blob.type.startsWith("image/")) {
        console.warn("[Yeet] Skipping non-image blob:", blob.type);
        continue;
      }
      const mime =
        blob.type && blob.type.startsWith("image/") ? blob.type : "image/jpeg";

      if (!src.startsWith("blob:") && blob.size < MIN_IMAGE_BYTES) {
        console.log(
          `[Yeet] Skipping tiny image (${blob.size}B) — likely a UI thumb.`,
        );
        continue;
      }
      if (src.startsWith("blob:") && blob.size < 2_000) {
        console.log(`[Yeet] Skipping tiny blob (${blob.size}B).`);
        continue;
      }

      const ext = extensionForMime(mime);
      files.push(
        new File([blob], `yeet-image-${files.length}.${ext}`, {
          type: mime,
        }),
      );
    } catch (err) {
      console.error("[Yeet] Failed to fetch attachment image:", err);
    }
  }

  console.log(`[Yeet] Captured ${files.length} image(s) from X composer.`);
  return files;
}

/**
 * Pull image Files from the X composer attachment strip.
 * Prefer calling snapshot + filesFromImageSrcs around awaits instead.
 */
export async function captureImagesFromXComposer(
  container: ParentNode,
): Promise<File[]> {
  const hasUnsupported = container.querySelectorAll(
    '[data-testid="attachments"] video, [data-testid="attachments"] [data-testid="gif"], [data-testid="attachments"] [data-testid="videoComponent"]',
  ).length;

  if (hasUnsupported > 0) {
    console.warn(
      "[Yeet] Videos/GIFs attached — only still images will be copied.",
    );
  }

  return filesFromImageSrcs(snapshotXComposerImageSrcs(container));
}
