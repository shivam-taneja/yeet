/**
 * Resolve when `predicate` becomes true, driven only by DOM mutations.
 */
export function waitFor(
  predicate: () => boolean,
  root: Node = document.body,
): Promise<void> {
  return new Promise((resolve) => {
    if (predicate()) {
      resolve();
      return;
    }

    const observer = new MutationObserver(() => {
      if (predicate()) {
        observer.disconnect();
        resolve();
      }
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
  });
}

/**
 * Like `waitFor`, but resolves `false` if `timeoutMs` elapses first.
 */
export function waitForTimeout(
  predicate: () => boolean,
  timeoutMs: number,
  root: Node = document.body,
): Promise<boolean> {
  return new Promise((resolve) => {
    if (predicate()) {
      resolve(true);
      return;
    }

    const observer = new MutationObserver(() => {
      if (predicate()) {
        cleanup();
        resolve(true);
      }
    });

    const timer = window.setTimeout(() => {
      cleanup();
      resolve(false);
    }, timeoutMs);

    function cleanup() {
      observer.disconnect();
      window.clearTimeout(timer);
    }

    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
  });
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * Wait until `predicate` is true continuously for `settleMs`.
 * Resets if it flips false (e.g. preview flashes then remount-wipes).
 * `timeoutMs` is only a safety ceiling — we return as soon as it sticks.
 */
export async function waitForSettledTrue(
  predicate: () => boolean,
  settleMs: number,
  timeoutMs: number,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  let stableSince = 0;

  // Also wake on DOM mutations so we don't solely poll on a timer.
  let mutated = false;
  const observer = new MutationObserver(() => {
    mutated = true;
  });
  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    characterData: true,
  });

  try {
    while (Date.now() < deadline) {
      if (predicate()) {
        if (!stableSince) stableSince = Date.now();
        else if (Date.now() - stableSince >= settleMs) return true;
      } else {
        stableSince = 0;
      }
      await sleep(mutated ? 50 : 100);
      mutated = false;
    }
  } finally {
    observer.disconnect();
  }

  return predicate();
}

/**
 * Wait until `getNode()` returns the same connected element for `settleMs`.
 * Resets the timer whenever the node is missing or replaced (Threads remounts).
 */
export async function waitForSettledNode(
  getNode: () => Element | null,
  settleMs: number,
  timeoutMs: number,
): Promise<Element | null> {
  const deadline = Date.now() + timeoutMs;
  let current: Element | null = null;
  let stableSince = 0;

  while (Date.now() < deadline) {
    const next = getNode();
    if (next && next.isConnected) {
      if (next === current) {
        if (Date.now() - stableSince >= settleMs) return next;
      } else {
        current = next;
        stableSince = Date.now();
      }
    } else {
      current = null;
      stableSince = 0;
    }
    await sleep(100);
  }

  const last = getNode();
  return last && last.isConnected ? last : null;
}
