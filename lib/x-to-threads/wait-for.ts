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
