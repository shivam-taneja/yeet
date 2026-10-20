function extensionForMime(mime: string): string {
  const subtype = mime.split("/")[1]?.split(";")[0]?.toLowerCase();
  if (!subtype) return "jpg";
  if (subtype === "jpeg") return "jpg";
  return subtype;
}

/** Timeline / tweet cards — never treat these as composer uploads. */
const FEED_MEDIA_ANCESTOR = 'article, [data-testid="tweet"]';

const VIDEO_OR_GIF_ANCESTOR =
  '[data-testid="videoComponent"], [data-testid="videoPlayer"], [data-testid="gif"]';

/** Video/GIF in the compose attachment strip (not the feed). */
const COMPOSER_UNSUPPORTED_MEDIA = [
  '[data-testid="attachments"] video',
  '[data-testid="attachments"] [data-testid="videoComponent"]',
  '[data-testid="attachments"] [data-testid="videoPlayer"]',
  '[data-testid="attachments"] [data-testid="gif"]',
  'video[src^="blob:"]',
].join(", ");

function isFeedMedia(el: Element): boolean {
  return Boolean(el.closest(FEED_MEDIA_ANCESTOR));
}

/**
 * Climb from a compose control to a shell that owns the textarea + media strip.
 */
function composeShellFrom(el: Element): Element {
  let best: Element = el;
  let cur: Element | null = el;
  for (let i = 0; i < 12 && cur && cur !== document.body; i++) {
    const hasToolbar = Boolean(cur.querySelector('[data-testid="toolBar"]'));
    const hasComposer = Boolean(
      cur.querySelector(
        '[data-testid^="tweetTextarea_"], [data-testid="attachments"]',
      ),
    );
    if (hasToolbar || hasComposer) best = cur;
    // Prefer dialog when present.
    if (cur.getAttribute("role") === "dialog") return cur;
    cur = cur.parentElement;
  }
  return best;
}

/**
 * True when the X composer has a video or GIF attached.
 * Those aren't copied yet — capture must bail instead of yeeting broken media.
 */
export function xComposerHasUnsupportedMedia(container: ParentNode): boolean {
  for (const node of Array.from(
    container.querySelectorAll(COMPOSER_UNSUPPORTED_MEDIA),
  )) {
    if (!isFeedMedia(node)) return true;
  }
  return false;
}

/**
 * Snapshot composer attachment image URLs synchronously.
 * Scoped to a compose shell: take `blob:` previews there, never feed media.
 * (Bare page-wide `img[src^=blob:]` was yeeting random timeline pics.)
 */
export function snapshotXComposerImageSrcs(container: ParentNode): string[] {
  const candidates = Array.from(
    container.querySelectorAll(
      [
        '[data-testid="attachments"] img',
        '[data-testid="tweetPhoto"] img',
        'img[src^="blob:"]',
      ].join(", "),
    ),
  ) as HTMLImageElement[];

  const srcs: string[] = [];
  const seen = new Set<string>();

  for (const img of candidates) {
    if (isFeedMedia(img)) continue;
    if (img.closest(VIDEO_OR_GIF_ANCESTOR)) continue;

    const src = img.currentSrc || img.src || "";
    if (!src || seen.has(src)) continue;
    // Live composer uploads are blob:; https thumbs in-compose aren't the File.
    if (!src.startsWith("blob:")) continue;

    // Skip tiny UI icons accidentally using blob URLs.
    const w = img.naturalWidth || img.width || img.clientWidth;
    const h = img.naturalHeight || img.height || img.clientHeight;
    if (w > 0 && h > 0 && w < 48 && h < 48) continue;

    seen.add(src);
    srcs.push(src);
  }

  console.log(
    `[Yeet] Composer image snapshot: ${srcs.length}`,
    srcs.map((s) => s.slice(0, 48)),
  );
  return srcs;
}

/**
 * Roots that own the compose attachment strip (dialog and/or inline).
 * Used by the warm cache so we never scan the whole timeline.
 */
export function findXComposerMediaRoots(): Element[] {
  const roots = new Set<Element>();

  for (const dialog of Array.from(
    document.querySelectorAll('[role="dialog"]'),
  )) {
    if (
      dialog.querySelector(
        '[data-testid="toolBar"], [data-testid="fileInput"], [data-testid^="tweetTextarea_"]',
      )
    ) {
      roots.add(dialog);
    }
  }

  for (const toolbar of Array.from(
    document.querySelectorAll('[data-testid="toolBar"]'),
  )) {
    if (isFeedMedia(toolbar)) continue;
    roots.add(composeShellFrom(toolbar));
  }

  for (const att of Array.from(
    document.querySelectorAll('[data-testid="attachments"]'),
  )) {
    if (isFeedMedia(att)) continue;
    roots.add(att.closest('[role="dialog"]') ?? composeShellFrom(att));
  }

  for (const ta of Array.from(
    document.querySelectorAll('[data-testid^="tweetTextarea_"]'),
  )) {
    if (isFeedMedia(ta)) continue;
    roots.add(ta.closest('[role="dialog"]') ?? composeShellFrom(ta));
  }

  return Array.from(roots);
}

/** Fetch Files from srcs that were snapshotted before any await. */
export async function filesFromImageSrcs(srcs: string[]): Promise<File[]> {
  const blobSrcs = srcs.filter((s) => s.startsWith("blob:"));
  const files: File[] = [];

  for (const src of blobSrcs) {
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

      // Composer blobs: only drop tiny junk. (MIN_IMAGE_BYTES is for https thumbs.)
      if (blob.size < 2_000) {
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
 * Returns [] when a video/GIF is attached (unsupported).
 */
export async function captureImagesFromXComposer(
  container: ParentNode,
): Promise<File[]> {
  if (xComposerHasUnsupportedMedia(container)) {
    console.warn("[Yeet] Videos/GIFs attached — image capture skipped.");
    return [];
  }

  return filesFromImageSrcs(snapshotXComposerImageSrcs(container));
}
