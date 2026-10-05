import { browser } from "wxt/browser";

const STORAGE_KEY = "pendingYeetText";

/** Exact text waiting to be injected into Threads. Cleared only after post success. */
export async function savePendingText(text: string): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: text });
}

export async function getPendingText(): Promise<string | null> {
  const result = await browser.storage.local.get(STORAGE_KEY);
  const text = result[STORAGE_KEY];
  return typeof text === "string" && text.length > 0 ? text : null;
}

export async function clearPendingText(): Promise<void> {
  await browser.storage.local.remove(STORAGE_KEY);
}
