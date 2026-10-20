/**
 * Attach Files to Threads' native composer file input (Crossposter-style).
 * Prefer input.files + change over Lexical paste — paste is for text only here.
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

export function findComposerRoot(composer: Element): Element {
  const dialog = composer.closest('[role="dialog"], dialog');
  if (dialog) return dialog;

  let current: Element | null = composer.parentElement;
  while (current && current !== document.body) {
    if (current.querySelector("input[type='file']")) return current;
    current = current.parentElement;
  }
  return document.body;
}

/**
 * Rough check that Threads kept a local media preview after attach.
 * Remounts wipe these — that's the flash-then-empty bug.
 */
export function composerHasMediaPreview(composerSelector: string): boolean {
  const composer = document.querySelector(composerSelector);
  if (!composer) return false;
  const root = findComposerRoot(composer);

  const imgs = Array.from(root.querySelectorAll("img"));
  for (const img of imgs) {
    const src = img.currentSrc || img.src || "";
    // Local upload previews are blob:/data:; skip tiny chrome icons.
    if (!src.startsWith("blob:") && !src.startsWith("data:")) continue;
    const w = img.naturalWidth || img.width || 0;
    const h = img.naturalHeight || img.height || 0;
    if (w > 0 && h > 0 && w < 48 && h < 48) continue;
    return true;
  }

  // Some builds keep a remove/dismiss control on each attachment.
  if (
    root.querySelector(
      '[aria-label*="Remove" i], [aria-label*="Delete" i], [aria-label*="photo" i]',
    )
  ) {
    return true;
  }

  return false;
}

function findCompatibleFileInput(
  files: File[],
  root: ParentNode,
): HTMLInputElement | null {
  const compatible = compatibleImageFiles(files);
  const inputs = Array.from(
    root.querySelectorAll("input[type='file']"),
  ) as HTMLInputElement[];

  return (
    inputs.find((el) => !el.disabled && acceptsFiles(el, compatible)) ?? null
  );
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

/** Drop fallback when no file input is found (Crossposter pattern). */
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
    return /select (?:a )?(?:photos?|videos?)|add media|add photos|drag.*drop|upload/.test(
      label,
    );
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

export function findThreadsFileInput(
  composerSelector: string,
  files: File[],
): HTMLInputElement | null {
  const composer = document.querySelector(composerSelector);
  if (!composer) return null;
  const root = findComposerRoot(composer);
  return findCompatibleFileInput(files, root);
}

/**
 * Attach images into the Threads composer. Returns how many files were handed
 * to the native input (or drop target).
 */
export function attachImagesToThreadsComposer(
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

  const root = findComposerRoot(composer);
  const input = findCompatibleFileInput(compatible, root);
  if (input) {
    const n = attachFilesToInput(compatible, input);
    console.log(`[Yeet] Attached ${n} image(s) via file input.`);
    return n;
  }

  const n = attachViaDrop(compatible, root);
  if (n) {
    console.log(`[Yeet] Attached ${n} image(s) via drop fallback.`);
  } else {
    console.warn("[Yeet] No compatible file input or drop target found.");
  }
  return n;
}
