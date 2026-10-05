import type { AppSettings, ThreadsContext } from "@/types/settings";

export const defaultThreadsContexts: AppSettings["threadsContexts"] = {
  "new-post": true,
  quote: false,
  reply: false,
  thread: false,
};

export function contextFromPlaceholder(
  placeholder: string,
): ThreadsContext | "unknown" {
  const p = placeholder.trim();
  if (/^what's new/i.test(p)) return "new-post";
  if (/^reply to/i.test(p)) return "reply";
  if (/share your thoughts/i.test(p)) return "quote";
  if (/another post/i.test(p)) return "thread";
  return "unknown";
}

export function readComposerPlaceholder(composer: Element): string {
  return (
    composer.getAttribute("aria-placeholder")?.trim() ||
    composer
      .closest(".x6ikm8r")
      ?.querySelector('[aria-hidden="true"] span')
      ?.textContent?.trim() ||
    ""
  );
}

function tagComposer(composer: Element): void {
  const ctx = contextFromPlaceholder(readComposerPlaceholder(composer));
  composer.setAttribute("data-yeet-context", ctx);
}

export function observeAndTagThreadsComposers(composerSelector: string) {
  const retag = () => {
    document.querySelectorAll(composerSelector).forEach((composer) => {
      tagComposer(composer);
    });
  };

  retag();

  const observer = new MutationObserver(retag);
  const targetNode = document.documentElement || document;
  observer.observe(targetNode, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["aria-placeholder", "data-lexical-editor"],
  });
}

export function getThreadsComposerContext(
  editorElement: Element | null,
): ThreadsContext | "unknown" {
  if (!editorElement) return "unknown";

  // Always prefer live placeholder — attribute can be stale after remounts.
  const live = contextFromPlaceholder(readComposerPlaceholder(editorElement));
  if (live !== "unknown") return live;

  return (
    (editorElement.getAttribute("data-yeet-context") as
      | ThreadsContext
      | "unknown") || "unknown"
  );
}
