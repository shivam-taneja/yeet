import { browser } from "wxt/browser";
import { fileFromDataUrl } from "@/lib/cross-post/data-url-file";

export type PendingImage = {
  name: string;
  mimeType: string;
  dataUrl: string;
};

export { fileFromDataUrl };

const STORAGE_KEY = "pendingYeetImages";

/** Threads carousel cap. */
export const MAX_PENDING_IMAGES = 10;

/** Drop UI thumbs / placeholders — real uploads are much larger. */
export const MIN_IMAGE_BYTES = 20_000;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("FileReader did not return a data URL."));
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("FileReader failed."));
    reader.readAsDataURL(file);
  });
}

export async function savePendingImages(files: File[]): Promise<void> {
  const capped = files.slice(0, MAX_PENDING_IMAGES);
  const pending: PendingImage[] = [];

  for (const file of capped) {
    const dataUrl = await readFileAsDataUrl(file);
    pending.push({
      name: file.name || "yeet-image.jpg",
      mimeType: file.type || "image/jpeg",
      dataUrl,
    });
  }

  await browser.storage.local.set({ [STORAGE_KEY]: pending });
}

export async function getPendingImages(): Promise<PendingImage[]> {
  const result = await browser.storage.local.get(STORAGE_KEY);
  const raw = result[STORAGE_KEY];
  if (!Array.isArray(raw) || raw.length === 0) return [];

  return raw.filter(
    (item): item is PendingImage =>
      Boolean(item) &&
      typeof item === "object" &&
      typeof (item as PendingImage).dataUrl === "string" &&
      typeof (item as PendingImage).name === "string",
  );
}

export async function getPendingImageFiles(): Promise<File[]> {
  const pending = await getPendingImages();
  return pending.map((item) =>
    fileFromDataUrl(item.name, item.mimeType || "image/jpeg", item.dataUrl),
  );
}

export async function clearPendingImages(): Promise<void> {
  await browser.storage.local.remove(STORAGE_KEY);
}

export async function hasPendingImages(): Promise<boolean> {
  const pending = await getPendingImages();
  return pending.length > 0;
}
