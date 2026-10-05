import { extractTextFromLexicalEditor } from "@/lib/dom-utils";
import type { SelectorsConfig } from "@/types/selectors";

export function findPostButton(selectors: SelectorsConfig): HTMLElement | null {
  const composer = document.querySelector(selectors.threads.composer);
  const container =
    (composer instanceof Element && composer.closest('[role="dialog"]')) ||
    document;

  const buttons = Array.from(
    container.querySelectorAll(selectors.threads.postButton),
  );

  return (
    (buttons.find((btn) => btn.textContent?.toLowerCase().trim() === "post") as
      | HTMLElement
      | undefined) ?? null
  );
}

export function isPostButtonReady(button: HTMLElement | null): boolean {
  if (!button) return false;
  if (button.getAttribute("aria-disabled") === "true") return false;
  if (button.hasAttribute("disabled")) return false;
  return true;
}

export function isMentionTypeaheadOpen(): boolean {
  return Boolean(
    document.querySelector(
      '[role="listbox"], [role="combobox"][aria-expanded="true"]',
    ),
  );
}

/** Lexical may expose a trailing newline in innerText for the last block. */
export function textLanded(live: string, expected: string): boolean {
  return live === expected || live === expected + "\n";
}

export function composerHasExactText(
  selectors: SelectorsConfig,
  expected: string,
): boolean {
  const composer = document.querySelector(
    selectors.threads.composer,
  ) as HTMLElement | null;
  if (!composer) return false;
  return textLanded(extractTextFromLexicalEditor(composer), expected);
}

export function isComposerReadyToPost(
  selectors: SelectorsConfig,
  expectedText: string,
): boolean {
  if (!composerHasExactText(selectors, expectedText)) return false;
  if (isMentionTypeaheadOpen()) return false;
  return isPostButtonReady(findPostButton(selectors));
}
