import type { SelectorsConfig } from "@/types/selectors";
import { captureFromX } from "@/lib/x-to-threads";

export function handleXPostClick(e: Event, selectors: SelectorsConfig): void {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("yeet_auto_post")) return;

  const target = e.target as HTMLElement;
  if (target.closest(selectors.x.postButtons)) {
    console.log("[Yeet] Intercepted X Post button click.");
    captureFromX(e, selectors);
  }
}

export function handleXPostKeydown(
  e: KeyboardEvent,
  selectors: SelectorsConfig,
): void {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("yeet_auto_post")) return;

  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    const target = e.target as HTMLElement;
    const selectorMatch = selectors.x.composer
      .replace(/[[\]"]/g, "")
      .split("=");

    const isComposer =
      target.closest(selectors.x.composer) != null ||
      target.getAttribute(selectorMatch[0]!) === selectorMatch[1];

    if (isComposer) {
      console.log("[Yeet] Intercepted X Post via Cmd+Enter.");
      captureFromX(e, selectors);
    }
  }
}
