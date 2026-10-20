/** Decode a data URL without `fetch(data:…)` (blocked by page CSP in MAIN world). */
export function fileFromDataUrl(
  name: string,
  mimeType: string,
  dataUrl: string,
): File {
  const match = dataUrl.match(/^data:([^;,]*)(;base64)?,([\s\S]*)$/);
  if (!match) {
    throw new Error(`Invalid data URL for ${name}`);
  }

  const type = mimeType || match[1] || "application/octet-stream";
  const isBase64 = Boolean(match[2]);
  const payload = match[3] ?? "";

  let bytes: Uint8Array;
  if (isBase64) {
    const binary = atob(payload);
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
  } else {
    bytes = new TextEncoder().encode(decodeURIComponent(payload));
  }

  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return new File([copy], name, { type });
}
