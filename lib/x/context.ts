import type { AppSettings, ComposerContext } from "@/types/settings";

export const defaultXContexts: AppSettings["xContexts"] = {
  "new-post": true,
  "mention-post": false,
  quote: false,
  reply: false,
  thread: false,
};

export function observeAndTagComposers() {
  const observer = new MutationObserver(() => {
    const placeholders = document.querySelectorAll(
      ".public-DraftEditorPlaceholder-inner",
    );

    placeholders.forEach((p) => {
      const text = p.textContent?.trim();
      if (!text) return;

      // Find the associated editor wrapper
      const wrapper = p.closest('[data-testid$="_label"]');
      if (!wrapper) return;

      const textbox = wrapper.querySelector('[role="textbox"]');
      if (textbox && !textbox.hasAttribute("data-yeet-context")) {
        let ctx = "unknown";
        if (/happening/i.test(text)) ctx = "new-post";
        else if (/reply/i.test(text)) ctx = "reply";
        else if (/comment/i.test(text)) ctx = "quote";
        else if (/another post/i.test(text)) ctx = "thread";
        else if (/^@/.test(text)) ctx = "mention-post";

        textbox.setAttribute("data-yeet-context", ctx);
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

export function getComposerContext(
  editorElement: Element | null,
): ComposerContext {
  if (!editorElement) return "unknown";
  return (
    (editorElement.getAttribute("data-yeet-context") as ComposerContext) ||
    "unknown"
  );
}
