import localSelectors from "./selectors.json";
import type { SelectorsConfig } from "@/types/selectors";

export const FALLBACK_SELECTORS = localSelectors as SelectorsConfig;

export function mergeSelectors(remote: any): SelectorsConfig {
  if (!remote) return FALLBACK_SELECTORS;
  return {
    ...FALLBACK_SELECTORS,
    ...remote,
    features: {
      ...FALLBACK_SELECTORS.features,
      ...(remote.features || {}),
    },
    x: {
      ...FALLBACK_SELECTORS.x,
      ...(remote.x || {}),
    },
    threads: {
      ...FALLBACK_SELECTORS.threads,
      ...(remote.threads || {}),
    },
  };
}
