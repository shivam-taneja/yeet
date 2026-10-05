import { extractTextFromDraftEditor } from "@/lib/dom-utils";

function textMatches(live: string, expected: string): boolean {
  return live === expected || live === expected + "\n";
}

function waitForText(composer: Element, expected: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (textMatches(extractTextFromDraftEditor(composer), expected)) {
      resolve(true);
      return;
    }

    const observer = new MutationObserver(() => {
      if (textMatches(extractTextFromDraftEditor(composer), expected)) {
        observer.disconnect();
        resolve(true);
      }
    });

    observer.observe(composer, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (textMatches(extractTextFromDraftEditor(composer), expected)) {
          observer.disconnect();
          resolve(true);
        } else {
          observer.disconnect();
          resolve(false);
        }
      });
    });
  });
}

/**
 * Drive X's Draft.js composer via execCommand in MAIN world.
 * Isolated-world paste does not reliably update Draft state.
 */
export async function injectTextViaDraft(
  composerSelector: string,
  text: string,
): Promise<boolean> {
  const composer = document.querySelector(composerSelector);
  if (!composer) {
    console.error("[Yeet] Inject: composer not found for", composerSelector);
    return false;
  }

  const editable =
    (composer.querySelector(
      '[contenteditable="true"]',
    ) as HTMLElement | null) || (composer as HTMLElement);

  editable.focus();

  try {
    document.execCommand("selectAll", false);
    document.execCommand("insertText", false, text);
  } catch (err) {
    console.error("[Yeet] Inject: execCommand failed:", err);
    return false;
  }

  if (textMatches(extractTextFromDraftEditor(composer), text)) return true;
  if (await waitForText(composer, text)) return true;

  console.log("[Yeet] Inject failed:", {
    live: extractTextFromDraftEditor(composer),
    expected: text,
  });
  return false;
}

export function readDraftPlainText(composerSelector: string): string {
  const composer = document.querySelector(composerSelector);
  return extractTextFromDraftEditor(composer);
}
