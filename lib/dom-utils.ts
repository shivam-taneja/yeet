/**
 * Pull plain text from X's Draft.js composer, preserving block newlines
 * and intra-line spaces exactly (no trim).
 */
export function extractTextFromDraftEditor(container: Element | null): string {
  if (!container) return "";

  const blocks = Array.from(container.querySelectorAll('[data-block="true"]'));

  return blocks
    .map((block) => {
      let line = "";
      block.querySelectorAll('[data-text="true"]').forEach((span) => {
        line += span.textContent ?? "";
      });
      return line;
    })
    .join("\n");
}

/**
 * Read plain text from Threads' Lexical composer via data-lexical-text spans
 * (matches the real DOM after typing). Falls back to innerText.
 */
export function extractTextFromLexicalEditor(
  container: Element | null,
): string {
  if (!container) return "";

  const paragraphs = Array.from(container.querySelectorAll(":scope > p"));
  if (paragraphs.length > 0) {
    return paragraphs
      .map((p) => {
        const spans = p.querySelectorAll('[data-lexical-text="true"]');
        if (spans.length === 0) return "";
        let line = "";
        spans.forEach((span) => {
          line += span.textContent ?? "";
        });
        return line;
      })
      .join("\n");
  }

  return (container as HTMLElement).innerText.replace(/\r\n/g, "\n");
}
