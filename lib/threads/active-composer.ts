import { extractTextFromLexicalEditor } from "@/lib/dom-utils";

let lastComposer: HTMLElement | null = null;

export function trackThreadsComposerFocus(composerSelector: string): void {
  const remember = (composer: Element | null) => {
    if (!(composer instanceof HTMLElement)) return;
    lastComposer = composer;
  };

  document.addEventListener(
    "focusin",
    (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      remember(t.closest(composerSelector));
    },
    true,
  );

  // Keep the handle fresh while typing (focus can move to the Post button).
  document.addEventListener(
    "input",
    (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      remember(t.closest(composerSelector));
    },
    true,
  );

  document.addEventListener(
    "keyup",
    (e) => {
      const t = e.target;
      if (!(t instanceof Element)) return;
      remember(t.closest(composerSelector));
    },
    true,
  );
}

/** Composer the user was just editing — survives focus moving to Post. */
export function getLastActiveThreadsComposer(): HTMLElement | null {
  if (!lastComposer || !document.contains(lastComposer)) {
    lastComposer = null;
    return null;
  }
  return lastComposer;
}

export function getLastActiveThreadsText(): string {
  const composer = getLastActiveThreadsComposer();
  return composer ? extractTextFromLexicalEditor(composer) : "";
}
