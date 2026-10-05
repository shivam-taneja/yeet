import type { SelectorsConfig } from "@/types/selectors";
import { captureFromThreads } from "@/lib/threads-to-x/capture-from-threads";
import { findThreadsPostSubmitFromEvent } from "@/lib/threads/post-button";

let lastCaptureAt = 0;

function captureOnce(e: Event, selectors: SelectorsConfig): void {
  const now = Date.now();
  // click + pointerup can both fire — only yeet once per gesture
  if (now - lastCaptureAt < 800) return;
  lastCaptureAt = now;
  void captureFromThreads(e, selectors);
}

export function handleThreadsPostClick(
  e: Event,
  selectors: SelectorsConfig,
): void {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("yeet_auto_post")) return;

  const submit = findThreadsPostSubmitFromEvent(e.target, selectors);
  if (!submit) return;

  console.log("[Yeet] Intercepted Threads Post button click.", {
    label: submit.textContent?.trim().slice(0, 40),
  });
  captureOnce(e, selectors);
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
      captureOnce(e, selectors);
    }
  }
}
