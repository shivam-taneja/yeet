import type { SelectorsConfig } from "@/types/selectors";

function normalizeLabel(text: string | null | undefined): string {
  return (text ?? "").replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * Climb from the submit control to the dialog (or a high ancestor) and return
 * every Lexical composer in that scope — not the first tiny ancestor hit.
 */
export function findComposersNearPostButton(
  button: Element,
  composerSelector: string,
): Element[] {
  let scope: Element | null =
    button.closest('[role="dialog"]') || button.closest("form") || null;

  if (!scope) {
    let el: Element | null = button.parentElement;
    for (let depth = 0; depth < 24 && el; depth++) {
      if (el.querySelector(composerSelector)) scope = el;
      el = el.parentElement;
    }
  }

  if (!scope) return [];
  return Array.from(scope.querySelectorAll(composerSelector));
}

export function findComposerNearPostButton(
  button: Element,
  composerSelector: string,
): Element | null {
  return findComposersNearPostButton(button, composerSelector)[0] ?? null;
}

function isInteractiveControl(el: Element): boolean {
  if (!(el instanceof HTMLElement)) return false;
  if (el.getAttribute("role") === "button") return true;
  if (el.tagName === "BUTTON") return true;
  if (el.hasAttribute("tabindex")) return true;
  return false;
}

function isInlineSubmitIcon(el: Element): boolean {
  return Boolean(
    el.querySelector('svg[aria-label="Reply"], svg[aria-label="Post"]') ||
    normalizeLabel(el.querySelector("svg title")?.textContent) === "reply",
  );
}

/**
 * Resolve the Threads submit control from a click/pointer target.
 * Covers popup/feed "Post" labels and the inline reply arrow.
 */
export function findThreadsPostSubmitFromEvent(
  target: EventTarget | null,
  selectors: SelectorsConfig,
): HTMLElement | null {
  if (!(target instanceof Element)) return null;

  const buttonSelector =
    selectors.threads.postButtons ||
    selectors.threads.postButton ||
    'div[role="button"], button';

  let el: Element | null = target;
  for (let depth = 0; depth < 10 && el; depth++) {
    const matchedBySelector = el.matches?.(buttonSelector) ? el : null;
    const control = matchedBySelector || (isInteractiveControl(el) ? el : null);

    if (control instanceof HTMLElement) {
      const label = normalizeLabel(control.textContent);

      if (label === "post") return control;

      if (
        isInlineSubmitIcon(control) &&
        findComposersNearPostButton(control, selectors.threads.composer)
          .length > 0
      ) {
        return control;
      }
    }

    el = el.parentElement;
  }

  const replySvg = target.closest(
    'svg[aria-label="Reply"], svg[aria-label="Post"]',
  );
  if (replySvg) {
    let host: Element | null = replySvg.parentElement;
    for (let depth = 0; depth < 6 && host; depth++) {
      if (
        host instanceof HTMLElement &&
        isInteractiveControl(host) &&
        findComposersNearPostButton(host, selectors.threads.composer).length > 0
      ) {
        return host;
      }
      host = host.parentElement;
    }
  }

  return null;
}

export function isThreadsPostSubmit(
  target: HTMLElement,
  selectors: SelectorsConfig,
): boolean {
  return findThreadsPostSubmitFromEvent(target, selectors) != null;
}
