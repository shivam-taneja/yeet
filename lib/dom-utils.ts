export function extractTextFromDraftEditor(container: Element | null): string {
  if (!container) return "";

  const blocks = container.querySelectorAll('[data-block="true"]');
  let text = "";

  blocks.forEach((block) => {
    const textSpans = block.querySelectorAll('[data-text="true"]');
    textSpans.forEach((span) => {
      text += span.textContent;
    });
    text += "\n";
  });

  return text.trim();
}

export function extractTextFromLexicalEditor(
  containerSelector: string,
): string {
  const container = document.querySelector(containerSelector) as HTMLElement;
  if (!container) return "";

  // Lexical editor uses innerText quite well for newlines
  return container.innerText.trim();
}
