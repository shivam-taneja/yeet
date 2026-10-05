import { browser } from "wxt/browser";
import { getXCharacterLimit } from "@/lib/character-limits";

const STORAGE_KEY = "xAccountPremium";

export function detectXPremiumInDocument(): boolean {
  return Boolean(document.querySelector('[data-testid="premium-hub-tab"]'));
}

export async function cacheXPremiumFlag(): Promise<void> {
  await browser.storage.local.set({
    [STORAGE_KEY]: detectXPremiumInDocument(),
  });
}

export async function getXCharacterLimitForYeet(): Promise<number> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  if (typeof stored[STORAGE_KEY] === "boolean") {
    return getXCharacterLimit(stored[STORAGE_KEY]);
  }
  return getXCharacterLimit(detectXPremiumInDocument());
}
