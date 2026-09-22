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

  observer.observe(document.body, { childList: true, subtree: true });
}
export function getThreadsComposerContext(
  editorElement: Element | null,
): ComposerContext {
  if (!editorElement) return "unknown";
  return (
    (editorElement.getAttribute("data-yeet-context") as ComposerContext) ||
    "unknown"
  );
}
