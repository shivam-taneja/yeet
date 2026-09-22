import type { AppSettings, ComposerContext } from "@/types/settings";

export const defaultThreadsContexts: AppSettings["threadsContexts"] = {
  "new-post": true,
  "mention-post": false,
  quote: false,
  reply: false,
  thread: false,
};

export function observeAndTagThreadsComposers() {
  const observer = new MutationObserver(() => {
    const editors = document.querySelectorAll(
      '[data-lexical-editor="true"][role="textbox"]',
    );

    editors.forEach((editor) => {
      if (editor.hasAttribute("data-yeet-context")) return;

      let ctx: ComposerContext = "unknown";
      const placeholder = editor.getAttribute("aria-placeholder") || "";

      if (/what's new/i.test(placeholder)) {
        ctx = "new-post";
      } else if (/reply/i.test(placeholder)) {
        ctx = "reply";
      } else if (/share your thoughts/i.test(placeholder)) {
        ctx = "quote";
      } else if (/say more/i.test(placeholder)) {
        ctx = "thread";
      } else {
        // If placeholder is empty or unrecognized, check if they manually started with an @ mention
        const text = editor.textContent?.trim() || "";
        if (text.startsWith("@")) {
          ctx = "mention-post";
        }
      }

      editor.setAttribute("data-yeet-context", ctx);
    });
  });

  const targetNode = document.documentElement || document.body;
  observer.observe(targetNode, { childList: true, subtree: true });
}
export function getThreadsComposerContext(
  editorElement: Element | null,
): ComposerContext {
  if (!editorElement) return "unknown";

  // First, try the cached attribute set by our observer.
  const cached = editorElement.getAttribute(
    "data-yeet-context",
  ) as ComposerContext;
  if (cached && cached !== "unknown") return cached;

  // Fallback: derive context directly from aria-placeholder (handles race conditions
  // where the observer hasn't fired yet before the user clicks Post).
  const placeholder = editorElement.getAttribute("aria-placeholder") || "";
  if (/what's new/i.test(placeholder)) return "new-post";
  if (/reply/i.test(placeholder)) return "reply";
  if (/share your thoughts/i.test(placeholder)) return "quote";
  if (/say more/i.test(placeholder)) return "thread";

  // Last resort: check if text starts with @ (mention from profile page)
  const text = editorElement.textContent?.trim() || "";
  if (text.startsWith("@")) return "mention-post";

  return "unknown";
}
