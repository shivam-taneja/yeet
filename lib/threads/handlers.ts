import type { SelectorsConfig } from "@/types/selectors";
import { captureFromThreads } from "@/lib/threads-to-x/capture-from-threads";

function isPostButton(
  target: HTMLElement,
  selectors: SelectorsConfig,
): boolean {
  const btn = target.closest(selectors.threads.postButtons);
  if (!btn) return false;
  return btn.textContent?.toLowerCase().trim() === "post";
}

export function handleThreadsPostClick(
  e: Event,
  selectors: SelectorsConfig,
): void {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("yeet_auto_post")) return;

  const target = e.target as HTMLElement;
  if (isPostButton(target, selectors)) {
    console.log("[Yeet] Intercepted Threads Post button click.");
    captureFromThreads(e, selectors);
  }
}

export function handleThreadsPostKeydown(
  e: KeyboardEvent,
  selectors: SelectorsConfig,
): void {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("yeet_auto_post")) return;

  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
    const target = e.target as HTMLElement;
    if (target.closest(selectors.threads.composer)) {
      console.log("[Yeet] Intercepted Threads Post via Cmd+Enter.");
      captureFromThreads(e, selectors);
    }
  }
}
