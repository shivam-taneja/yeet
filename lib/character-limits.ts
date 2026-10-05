/** Destination character limits (not encoded in URLs — checked before yeeting). */
export const CHARACTER_LIMITS = {
  threads: 500,
  x: {
    free: 280,
    premium: 25_000,
  },
} as const;

export function getXCharacterLimit(isPremium: boolean): number {
  return isPremium ? CHARACTER_LIMITS.x.premium : CHARACTER_LIMITS.x.free;
}

export function formatOverLimitMessage(
  destination: "X" | "Threads",
  limit: number,
): string {
  return `Yeet failed: ${destination} only supports up to ${limit} characters per post! Your post is too big to Yeet.`;
}
