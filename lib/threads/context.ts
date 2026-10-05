import type { AppSettings, ThreadsContext } from "@/types/settings";

export const defaultThreadsContexts: AppSettings["threadsContexts"] = {
  "new-post": true,
  quote: false,
  reply: false,
  thread: false,
};

function contextFromPlaceholder(
  placeholder: string,
): ThreadsContext | "unknown" {
  const p = placeholder.trim();
  if (/^what's new/i.test(p)) return "new-post";
  if (/^reply to/i.test(p)) return "reply";
  if (/share your thoughts/i.test(p)) return "quote";
  if (/another post/i.test(p)) return "thread";
  return "unknown";
}

export function observeAndTagThreadsComposers(composerSelector: string) {
  const observer = new MutationObserver(() => {
    const composers = document.querySelectorAll(composerSelector);

    composers.forEach((composer) => {
      if (composer.hasAttribute("data-yeet-context")) return;

      const placeholder =
        composer.getAttribute("aria-placeholder")?.trim() ||
        composer
          .closest(".x6ikm8r")
          ?.querySelector('[aria-hidden="true"] span')
          ?.textContent?.trim() ||
        "";

      const ctx = contextFromPlaceholder(placeholder);
      composer.setAttribute("data-yeet-context", ctx);
    });
  });

  const targetNode = document.documentElement || document;
  observer.observe(targetNode, {
    childList: true,
    subtree: true,
    attributes: true,
  });
}

export function getThreadsComposerContext(
  editorElement: Element | null,
): ThreadsContext | "unknown" {
  if (!editorElement) return "unknown";
  return (
    (editorElement.getAttribute("data-yeet-context") as
      | ThreadsContext
      | "unknown") || "unknown"
  );
}
