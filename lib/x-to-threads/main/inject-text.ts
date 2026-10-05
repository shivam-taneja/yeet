/**
 * Drive Threads' Lexical editor via setEditorState.
 * Synthetic paste / execCommand are ignored by Lexical.
 */

function textMatches(live: string, expected: string): boolean {
  return live === expected || live === expected + "\n";
}

export function readLexicalPlainText(composer: HTMLElement): string {
  const paragraphs = Array.from(composer.querySelectorAll(":scope > p"));
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
  return composer.innerText.replace(/\r\n/g, "\n");
}

function findEditorOnNode(el: HTMLElement): any | null {
  const anyEl = el as any;
  if (anyEl.__lexicalEditor?.parseEditorState) return anyEl.__lexicalEditor;

  const propsKey = Object.keys(anyEl).find((k) =>
    k.startsWith("__reactProps$"),
  );
  if (propsKey) {
    const props = anyEl[propsKey];
    if (props?.editor?.parseEditorState) return props.editor;
    if (props?.value?.editor?.parseEditorState) return props.value.editor;
  }

  const fiberKey = Object.keys(anyEl).find(
    (k) =>
      k.startsWith("__reactFiber$") || k.startsWith("__reactInternalInstance$"),
  );
  let fiber = fiberKey ? anyEl[fiberKey] : null;
  let depth = 0;
  while (fiber && depth < 50) {
    const p = fiber.memoizedProps || fiber.pendingProps || {};
    if (p.editor?.parseEditorState) return p.editor;
    if (p.value?.editor?.parseEditorState) return p.value.editor;
    if (fiber.stateNode?.__lexicalEditor?.parseEditorState) {
      return fiber.stateNode.__lexicalEditor;
    }
    fiber = fiber.return;
    depth++;
  }
  return null;
}

export function findLexicalEditor(el: HTMLElement): any | null {
  const direct = findEditorOnNode(el);
  if (direct) return direct;

  let parent: HTMLElement | null = el.parentElement;
  let hops = 0;
  while (parent && hops < 10) {
    const found = findEditorOnNode(parent);
    if (found) return found;
    parent = parent.parentElement;
    hops++;
  }
  return null;
}

function buildEditorStateJSON(text: string) {
  const lines = text.split("\n");
  return {
    root: {
      children: lines.map((line) => ({
        children: line
          ? [
              {
                detail: 0,
                format: 0,
                mode: "normal",
                style: "",
                text: line,
                type: "text",
                version: 1,
              },
            ]
          : [],
        direction: "ltr",
        format: "",
        indent: 0,
        type: "paragraph",
        version: 1,
      })),
      direction: "ltr",
      format: "",
      indent: 0,
      type: "root",
      version: 1,
    },
  };
}

function waitForText(
  composer: HTMLElement,
  expected: string,
): Promise<boolean> {
  return new Promise((resolve) => {
    if (textMatches(readLexicalPlainText(composer), expected)) {
      resolve(true);
      return;
    }

    const observer = new MutationObserver(() => {
      if (textMatches(readLexicalPlainText(composer), expected)) {
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
        if (textMatches(readLexicalPlainText(composer), expected)) {
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

export async function injectTextViaLexical(
  composerSelector: string,
  text: string,
): Promise<boolean> {
  const composer = document.querySelector(
    composerSelector,
  ) as HTMLElement | null;
  if (!composer) {
    console.error("[Yeet] Inject: composer not found for", composerSelector);
    return false;
  }

  const editor = findLexicalEditor(composer);
  if (!editor) {
    console.warn("[Yeet] Inject: Lexical editor instance not found.");
    return false;
  }

  console.log("[Yeet] Inject: Lexical setEditorState…");
  try {
    const parsed = editor.parseEditorState(
      JSON.stringify(buildEditorStateJSON(text)),
    );
    editor.setEditorState(parsed);
    if (typeof editor.focus === "function") editor.focus();
  } catch (err) {
    console.error("[Yeet] Inject: setEditorState failed:", err);
    return false;
  }

  if (textMatches(readLexicalPlainText(composer), text)) return true;
  if (await waitForText(composer, text)) return true;

  console.log("[Yeet] Inject failed:", {
    live: readLexicalPlainText(composer),
    expected: text,
  });
  return false;
}
