/**
 * Attach Files to Threads' native composer file input.
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

  // Prefer the ancestor that owns the real compose chrome (file input +
  // "Attach media"), not a nested stray input.
  let current: Element | null = composer.parentElement;
  let withFile: Element | null = null;
  while (current && current !== document.body) {
    if (current.querySelector("input[type='file']")) {
      withFile = current;
      if (
        current.querySelector(
          '[aria-label="Attach media"], picture img[src^="blob:"]',
        )
      ) {
        return current;
      }
    }
    current = current.parentElement;
  }
  return withFile || document.body;
}

function imageBoxSize(img: HTMLImageElement): { w: number; h: number } {
  const w =
    img.naturalWidth ||
    img.width ||
    Number(img.getAttribute("width")) ||
    0;
  const h =
    img.naturalHeight ||
    img.height ||
    Number(img.getAttribute("height")) ||
    0;
  return { w, h };
}

function hasAttachmentRemoveControl(root: ParentNode): boolean {
  if (
    root.querySelector(
      '[aria-label*="Remove" i], [aria-label*="Delete" i]',
    )
  ) {
    return true;
  }
  // Threads puts title="Remove" / <title>Remove</title> on the SVG, not aria-label.
  for (const el of Array.from(
    root.querySelectorAll("svg[title], svg title, [title]"),
  )) {
    const t =
      (el.getAttribute("title") || el.textContent || "").trim().toLowerCase();
    if (t === "remove" || t === "delete") return true;
  }
  return false;
}

/**
 * True when Threads is showing an attached media preview in the composer.
 * Real markup (2026-10): `<picture><img src="blob:https://www.threads.com/…">`
 * sits as a sibling of Lexical, with an SVG "Remove" control on the thumb.
 */
export function composerHasMediaPreview(composerSelector: string): boolean {
  const composer = document.querySelector(composerSelector);
  if (!composer) return false;
  const root = findComposerRoot(composer);

  // Prefer the explicit Threads preview: picture > blob img
  const candidates = Array.from(
    root.querySelectorAll(
      'picture img[src^="blob:"], img[src^="blob:https://www.threads.com/"], img[src^="blob:"], img[src^="data:image"]',
    ),
  ) as HTMLImageElement[];

  for (const img of candidates) {
    // Skip icons / avatars — real previews are large (e.g. 1354×260).
    const { w, h } = imageBoxSize(img);
    if (w > 0 && h > 0 && w < 48 && h < 48) continue;
    return true;
  }

  if (hasAttachmentRemoveControl(root)) return true;

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
