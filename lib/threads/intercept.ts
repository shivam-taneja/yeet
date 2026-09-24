import type { SelectorsConfig } from "@/types/selectors";
import { doYeetToX } from "./yeet";

export function handleThreadsPostClick(e: Event, selectors: SelectorsConfig) {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("yeet_auto_post")) return;

  const target = e.target as HTMLElement;
  const postBtn = target.closest(selectors.threads.postButton);

  if (postBtn) {
    const text = postBtn.textContent?.toLowerCase().trim() || "";
    if (text === "post" || (text.includes("post") && text.length < 15)) {
      console.log("[Yeet] Intercepted Threads Post button click.");
      doYeetToX(e, selectors);
    }
  }
}

export function handleThreadsPostKeydown(
  e: KeyboardEvent,
  selectors: SelectorsConfig,
) {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("yeet_auto_post")) return;

  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    const target = e.target as HTMLElement;
    const selectorMatch = selectors.threads.composer
      .replace(/[[\]"]/g, "")
      .split("=");

    const isComposer =
      target.closest(selectors.threads.composer) != null ||
      target.getAttribute(selectorMatch[0]!) === selectorMatch[1];

    if (isComposer) {
      console.log("[Yeet] Intercepted Threads Post via Cmd+Enter.");
      doYeetToX(e, selectors);
    }
  }
}
