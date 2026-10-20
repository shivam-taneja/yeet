/**
 * Capture still images from the Threads composer (not the feed).
 * Previews are typically `picture > img[src^=blob:]` beside Lexical.
 */

function extensionForMime(mime: string): string {
  const subtype = mime.split("/")[1]?.split(";")[0]?.toLowerCase();
  if (!subtype) return "jpg";
  if (subtype === "jpeg") return "jpg";
  return subtype;
}

/** Climb from Lexical to the shell that owns Attach media / previews. */
export function findThreadsComposerRoot(composer: Element): Element {
  const dialog = composer.closest('[role="dialog"], dialog');
  if (dialog) return dialog;

  let current: Element | null = composer.parentElement;
  let withMedia: Element | null = null;
  while (current && current !== document.body) {
    if (
      current.querySelector(
        'input[type="file"], [aria-label="Attach media"], picture img[src^="blob:"]',
      )
    ) {
      withMedia = current;
      if (
        current.querySelector(
          '[aria-label="Attach media"], picture img[src^="blob:"]',
        )
      ) {
        return current;
      }
    }
    current = current.parentElement;
  }
  return withMedia || composer.parentElement || document.body;
}

export function findThreadsComposerMediaRoots(
  composerSelector: string,
): Element[] {
  const roots = new Set<Element>();

  for (const composer of Array.from(
    document.querySelectorAll(composerSelector),
  )) {
    roots.add(findThreadsComposerRoot(composer));
  }

  for (const dialog of Array.from(
    document.querySelectorAll('[role="dialog"], dialog'),
  )) {
    if (
      dialog.querySelector(
        'input[type="file"], [aria-label="Attach media"], picture img[src^="blob:"]',
      )
    ) {
      roots.add(dialog);
    }
  }

  return Array.from(roots);
}

export function threadsComposerHasUnsupportedMedia(
  container: ParentNode,
): boolean {
  return Boolean(
    container.querySelector(
      "video, video[src^='blob:'], picture video, [aria-label*='Remove GIF' i]",
    ),
  );
}

/**
 * Snapshot composer attachment blob URLs synchronously.
 * Scoped to a compose root — never feed posts.
 */
export function snapshotThreadsComposerImageSrcs(
  container: ParentNode,
): string[] {
  const candidates = Array.from(
    container.querySelectorAll(
      'picture img[src^="blob:"], img[src^="blob:https://www.threads.com/"], img[src^="blob:"]',
    ),
  ) as HTMLImageElement[];

  const srcs: string[] = [];
  const seen = new Set<string>();

  for (const img of candidates) {
    // Feed posts live in article-like cards; composer previews do not.
    if (img.closest("article, [data-pressable-container] a[href*='/post/']")) {
      continue;
    }
    if (img.closest("video, [aria-label*='GIF' i]")) continue;

    const src = img.currentSrc || img.src || "";
    if (!src || seen.has(src)) continue;
    if (!src.startsWith("blob:")) continue;

    const w = img.naturalWidth || img.width || img.clientWidth;
    const h = img.naturalHeight || img.height || img.clientHeight;
    if (w > 0 && h > 0 && w < 48 && h < 48) continue;

    seen.add(src);
    srcs.push(src);
  }

  console.log(
    `[Yeet] Threads composer image snapshot: ${srcs.length}`,
    srcs.map((s) => s.slice(0, 48)),
  );
  return srcs;
}

/** Fetch Files from blob srcs snapshotted before any await. */
export async function filesFromImageSrcs(srcs: string[]): Promise<File[]> {
  const blobSrcs = srcs.filter((s) => s.startsWith("blob:"));
  const files: File[] = [];

  for (const src of blobSrcs) {
    try {
      const res = await fetch(src);
      const blob = await res.blob();
      if (blob.type && !blob.type.startsWith("image/")) {
        console.warn("[Yeet] Skipping non-image blob:", blob.type);
        continue;
      }
      const mime =
        blob.type && blob.type.startsWith("image/") ? blob.type : "image/jpeg";

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
      console.error("[Yeet] Failed to fetch Threads attachment image:", err);
    }
  }

  console.log(
    `[Yeet] Captured ${files.length} image(s) from Threads composer.`,
  );
  return files;
}
