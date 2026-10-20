import {
  snapshotXComposerImageSrcs,
  filesFromImageSrcs,
} from "@/lib/x-to-threads/capture-images";

/**
 * X clears composer attachments the instant Post is pressed (often before
 * our click handler can fetch blob: URLs). Keep Files warm while the user
 * is still composing so yeet can attach them after Post.
 */

let cachedFiles: File[] = [];
let cachedSrcKey = "";
let prefetching = false;
let observer: MutationObserver | null = null;

function srcKey(srcs: string[]): string {
  return srcs.slice().sort().join("|");
}

async function prefetchFromDocument(): Promise<void> {
  if (prefetching) return;
  const srcs = snapshotXComposerImageSrcs(document);
  const key = srcKey(srcs);

  if (srcs.length === 0) {
    if (cachedFiles.length > 0) {
      console.log("[Yeet] Warm image cache cleared (no attachments in DOM).");
    }
    cachedFiles = [];
    cachedSrcKey = "";
    return;
  }

  if (key === cachedSrcKey && cachedFiles.length > 0) return;

  prefetching = true;
  try {
    const files = await filesFromImageSrcs(srcs);
    // Only replace cache if DOM still matches what we fetched.
    const still = srcKey(snapshotXComposerImageSrcs(document));
    if (still === key && files.length > 0) {
      cachedFiles = files;
      cachedSrcKey = key;
      console.log(
        `[Yeet] Warm image cache ready: ${files.length} file(s)`,
        files.map((f) => `${f.name}:${f.size}B`),
      );
    }
  } finally {
    prefetching = false;
  }
}

function schedulePrefetch(): void {
  window.setTimeout(() => {
    void prefetchFromDocument();
  }, 50);
}

/** Start watching the page for composer attachments. Call once from X CS. */
export function startWarmImageCache(): void {
  if (observer) return;

  observer = new MutationObserver(() => schedulePrefetch());
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["src", "srcset"],
  });

  // Drop / paste into composer often adds blobs without a full remount.
  document.addEventListener("drop", schedulePrefetch, true);
  document.addEventListener("paste", schedulePrefetch, true);
  document.addEventListener("change", schedulePrefetch, true);

  schedulePrefetch();
  console.log("[Yeet] Warm image cache watching for attachments.");
}

/** Copy of cached Files at Post time (blobs may already be revoked in the DOM). */
export function takeWarmCachedImages(): File[] {
  if (cachedFiles.length === 0) {
    console.log("[Yeet] Warm image cache empty at Post.");
    return [];
  }
  console.log(`[Yeet] Using warm image cache: ${cachedFiles.length} file(s)`);
  return cachedFiles.map(
    (f) =>
      new File([f], f.name, { type: f.type, lastModified: f.lastModified }),
  );
}

/**
 * If the user hits Post right after attaching, prefetch may still be in flight.
 * Wait briefly for the warm cache to finish.
 */
export async function awaitWarmCachedImages(timeoutMs = 1000): Promise<File[]> {
  const existing = takeWarmCachedImages();
  if (existing.length > 0) return existing;

  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!prefetching && cachedFiles.length > 0) {
      return takeWarmCachedImages();
    }
    // Kick a fetch if DOM still has srcs.
    if (!prefetching) void prefetchFromDocument();
    await new Promise((r) => setTimeout(r, 50));
  }

  return takeWarmCachedImages();
}

export function clearWarmImageCache(): void {
  cachedFiles = [];
  cachedSrcKey = "";
}
