import localSelectors from "./selectors.json";

export const FALLBACK_SELECTORS = localSelectors as {
  features: { xToThreads: boolean; threadsToX: boolean };
  x: { composer: string; postButtons: string; intentPostButton: string };
  threads: { composer: string; postButton: string };
};

export function mergeSelectors(remote: any): typeof FALLBACK_SELECTORS {
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
