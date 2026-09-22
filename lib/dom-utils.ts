export function extractTextFromDraftEditor(container: Element | null): string {
  if (!container) return "";

  const textBlocks = container.querySelectorAll('[data-text="true"]');
  let text = "";
  textBlocks.forEach((block) => {
    text += block.textContent + "\n";
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
