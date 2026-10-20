/**
 * Attach Files to X's native composer file input (`data-testid="fileInput"`).
 * Prefer input.files + change — do not click the media button (opens OS picker).
 */

function compatibleImageFiles(files: File[]): File[] {
  return files.filter((file) => file.type.startsWith("image/"));
}

function acceptsFiles(input: HTMLInputElement, files: File[]): boolean {
  const accept = input.accept || "";
  if (!accept || !files.length) return true;

  return files.every((file) =>
    accept.split(",").some((rule) => {
      const value = rule.trim().toLowerCase();
      return (
        value === "*/*" ||
        value === file.type.toLowerCase() ||
        (value.endsWith("/*") &&
          file.type.toLowerCase().startsWith(value.slice(0, -1))) ||
        (value.startsWith(".") &&
          String(file.name || "")
            .toLowerCase()
            .endsWith(value))
      );
    }),
  );
}

/** Compose dialog, or a shell around the Draft textarea + toolbar. */
export function findXComposerRoot(composer: Element): Element {
  const dialog = composer.closest('[role="dialog"]');
  if (dialog) return dialog;

  let current: Element | null = composer.parentElement;
  let withFile: Element | null = null;
  while (current && current !== document.body) {
    if (
      current.querySelector(
        'input[type="file"][data-testid="fileInput"], input[type="file"]',
      )
    ) {
      withFile = current;
      if (current.querySelector('[data-testid="toolBar"]')) return current;
    }
    current = current.parentElement;
  }
  return withFile || document.body;
}

function fileTransfer(files: File[]): DataTransfer {
  const transfer = new DataTransfer();
  for (const file of files) {
    transfer.items.add(file);
  }
  return transfer;
}

export function attachFilesToInput(
  files: File[],
  input: HTMLInputElement,
): number {
  const compatible = compatibleImageFiles(files);
  if (!input || compatible.length === 0) return 0;

  const transfer = fileTransfer(compatible);
  input.files = transfer.files;
  input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  input.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  return compatible.length;
}

function findCompatibleFileInput(
  files: File[],
  root: ParentNode,
): HTMLInputElement | null {
  const compatible = compatibleImageFiles(files);
  const preferred = root.querySelector(
    'input[type="file"][data-testid="fileInput"]',
  ) as HTMLInputElement | null;
  if (preferred && !preferred.disabled && acceptsFiles(preferred, compatible)) {
    return preferred;
  }

  const inputs = Array.from(
    root.querySelectorAll("input[type='file']"),
  ) as HTMLInputElement[];

  return (
    inputs.find((el) => !el.disabled && acceptsFiles(el, compatible)) ?? null
  );
}

/** Drop fallback when no file input is found. */
function attachViaDrop(files: File[], root: ParentNode): number {
  const compatible = compatibleImageFiles(files);
  if (!compatible.length) return 0;

  const dropTarget = Array.from(
    root.querySelectorAll(
      "button, [role='button'], [role='presentation'], div",
    ),
  ).find((el) => {
    if (!(el instanceof HTMLElement)) return false;
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return false;
    const label = (el.innerText || el.getAttribute("aria-label") || "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
    return /media|photos?|images?|gif|upload|drag/.test(label);
  });

  if (!dropTarget) return 0;

  const transfer = fileTransfer(compatible);
  try {
    for (const type of ["dragenter", "dragover", "drop"] as const) {
      dropTarget.dispatchEvent(
        new DragEvent(type, {
          bubbles: true,
          cancelable: true,
          dataTransfer: transfer,
        }),
      );
    }
    return compatible.length;
  } catch {
    return 0;
  }
}

export function findXFileInput(
  composerSelector: string,
  files: File[],
): HTMLInputElement | null {
  const composer = document.querySelector(composerSelector);
  if (!composer) return null;
  return findCompatibleFileInput(files, findXComposerRoot(composer));
}

/**
 * True when X is showing an attached media preview in the composer.
 * Prefers `[data-testid="attachments"]` inside the compose shell (not the feed).
 */
export function composerHasMediaPreview(composerSelector: string): boolean {
  const composer = document.querySelector(composerSelector);
  if (!composer) return false;
  const root = findXComposerRoot(composer);

  if (
    root.querySelector(
      '[data-testid="attachments"] img, [data-testid="attachments"] [data-testid="tweetPhoto"], [data-testid="attachments"] video',
    )
  ) {
    return true;
  }

  for (const el of Array.from(
    root.querySelectorAll("button, [role='button']"),
  )) {
    const label = (
      el.getAttribute("aria-label") ||
      el.textContent ||
      ""
    ).toLowerCase();
    if (/remove (media|image|photo|video|gif)|remove$/i.test(label.trim())) {
      return true;
    }
  }

  return false;
}

/**
 * Attach images into the X composer. Returns how many files were handed off.
 */
export function attachImagesToXComposer(
  composerSelector: string,
  files: File[],
): number {
  const compatible = compatibleImageFiles(files);
  if (!compatible.length) return 0;

  const composer = document.querySelector(composerSelector);
  if (!composer) {
    console.warn("[Yeet] Composer not found for media attach.");
    return 0;
  }

  const root = findXComposerRoot(composer);
  const input = findCompatibleFileInput(compatible, root);
  if (input) {
    const n = attachFilesToInput(compatible, input);
    console.log(`[Yeet] Attached ${n} image(s) via X file input.`);
    return n;
  }

  const n = attachViaDrop(compatible, root);
  if (n) {
    console.log(`[Yeet] Attached ${n} image(s) via drop fallback.`);
  } else {
    console.warn("[Yeet] No compatible file input or drop target on X.");
  }
  return n;
}
