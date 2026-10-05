import { extractTextFromDraftEditor } from "@/lib/dom-utils";
import type { SelectorsConfig } from "@/types/selectors";

export function findPostButton(selectors: SelectorsConfig): HTMLElement | null {
  const composer = document.querySelector(selectors.x.composer);
  const container =
    (composer instanceof Element && composer.closest('[role="dialog"]')) ||
    document;

  const buttons = Array.from(
    container.querySelectorAll(selectors.x.postButtons),
  );

  return (
    (buttons.find((btn) => {
      const label = btn.textContent?.toLowerCase().trim();
      return label === "post" || label === "reply";
    }) as HTMLElement | undefined) ?? null
  );
}

export function isPostButtonReady(button: HTMLElement | null): boolean {
  if (!button) return false;
  if (button.getAttribute("aria-disabled") === "true") return false;
  if (button.hasAttribute("disabled")) return false;
  return true;
}

export function textLanded(live: string, expected: string): boolean {
  return live === expected || live === expected + "\n";
}

export function composerHasExactText(
  selectors: SelectorsConfig,
  expected: string,
): boolean {
  const composer = document.querySelector(selectors.x.composer);
  if (!composer) return false;
  return textLanded(extractTextFromDraftEditor(composer), expected);
}

export function isComposerReadyToPost(
  selectors: SelectorsConfig,
  expectedText: string,
): boolean {
  if (!composerHasExactText(selectors, expectedText)) return false;
  return isPostButtonReady(findPostButton(selectors));
}
