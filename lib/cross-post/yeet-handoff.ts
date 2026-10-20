import { browser } from "wxt/browser";

const TOKEN_KEY = "yeetHandoffToken";
const MODE_KEY = "yeetHandoffMode";

/** Handoffs older than this are ignored (stale storage). */
const HANDOFF_TTL_MS = 90_000;

export type YeetHandoffMode = "text" | "media";

export type YeetHandoff = {
  token: number;
  mode: YeetHandoffMode;
};

/** Call when opening the destination tab — don’t rely on URL query (SPA strips it). */
export async function markYeetHandoff(mode: YeetHandoffMode): Promise<void> {
  await browser.storage.local.set({
    [TOKEN_KEY]: Date.now(),
    [MODE_KEY]: mode,
  });
}

export async function peekYeetHandoff(): Promise<YeetHandoff | null> {
  const result = await browser.storage.local.get([TOKEN_KEY, MODE_KEY]);
  const token = result[TOKEN_KEY];
  const mode = result[MODE_KEY];
  if (typeof token !== "number") return null;
  if (Date.now() - token > HANDOFF_TTL_MS) return null;
  if (mode !== "text" && mode !== "media") return null;
  return { token, mode };
}

/** Claim once so a later Threads visit doesn’t re-fire the same yeet. */
export async function claimYeetHandoff(): Promise<YeetHandoff | null> {
  const handoff = await peekYeetHandoff();
  if (!handoff) return null;
  await browser.storage.local.remove([TOKEN_KEY, MODE_KEY]);
  return handoff;
}

export async function clearYeetHandoff(): Promise<void> {
  await browser.storage.local.remove([TOKEN_KEY, MODE_KEY]);
}
