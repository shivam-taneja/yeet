export interface PendingMedia {
  base64: string;
  mimeType: string;
  name: string;
}

const STORAGE_KEY = "pendingYeetMedia";

export async function savePendingMedia(files: File[]): Promise<void> {
  const pendingMediaArray: PendingMedia[] = [];

  for (const file of files) {
    const arrayBuffer = await file.arrayBuffer();
    const uint8 = new Uint8Array(arrayBuffer);
    const base64 = btoa(String.fromCharCode(...uint8));

    pendingMediaArray.push({
      base64,
      mimeType: file.type,
      name: file.name,
    });
  }

  await new Promise<void>((resolve, reject) => {
    chrome.storage.local.set({ [STORAGE_KEY]: pendingMediaArray }, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve();
    });
  });
}

export async function getPendingMedia(): Promise<File[]> {
  const result = await new Promise<Record<string, any>>((resolve, reject) => {
    chrome.storage.local.get(STORAGE_KEY, (res) => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(res);
    });
  });

  const pendingMediaArray = result[STORAGE_KEY] as PendingMedia[];

  if (!pendingMediaArray || pendingMediaArray.length === 0) {
    return [];
  }

  return pendingMediaArray.map((media) => {
    const binary = atob(media.base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: media.mimeType });

    return new File([blob], media.name, { type: media.mimeType });
  });
}

export async function clearPendingMedia(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    chrome.storage.local.remove(STORAGE_KEY, () => {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve();
    });
  });
}

export async function getPendingMediaSize(): Promise<number> {
  const result = await new Promise<Record<string, any>>((resolve, reject) => {
    chrome.storage.local.get(STORAGE_KEY, (res) => {
      if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
      resolve(res);
    });
  });

  const pendingMediaArray = result[STORAGE_KEY] as PendingMedia[] | undefined;
  if (!pendingMediaArray || pendingMediaArray.length === 0) return 0;

  return pendingMediaArray.reduce((total, media) => {
    // base64 length * 0.75 gives approximate byte size
    return total + Math.round(media.base64.length * 0.75);
  }, 0);
}
