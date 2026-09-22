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
    const textboxes = document.querySelectorAll(
      '[role="textbox"][data-testid^="tweetTextarea_"]',
    );

    textboxes.forEach((textbox) => {
      if (textbox.hasAttribute("data-yeet-context")) return;

      const wrapper = textbox.closest('[data-testid$="_label"]');
      if (!wrapper) return;

      let ctx = "unknown";

      // 1. Try to find the placeholder
      const placeholder = wrapper.querySelector(
        ".public-DraftEditorPlaceholder-inner",
      );

      if (placeholder) {
        const text = placeholder.textContent?.trim() || "";
        if (/happening/i.test(text)) ctx = "new-post";
        else if (/reply/i.test(text)) ctx = "reply";
        else if (/comment/i.test(text)) ctx = "quote";
        else if (/another post/i.test(text)) ctx = "thread";
      } else {
        // 2. If no placeholder exists, it might be pre-filled (like a mention post).
        // Draft.js editor contents are nested inside the textbox.
        const text = textbox.textContent?.trim() || "";
        if (text.startsWith("@")) {
          ctx = "mention-post";
        }
      }

      textbox.setAttribute("data-yeet-context", ctx);
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
