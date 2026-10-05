import { browser } from "wxt/browser";
import { getPendingText } from "@/lib/cross-post/pending-text";
import { waitFor } from "@/lib/x-to-threads/wait-for";
import { askMainWorldToInject } from "@/lib/cross-post/ask-main-to-inject";
import {
  findPostButton,
  isComposerReadyToPost,
} from "@/lib/x-to-threads/composer-ui";
import { listenForPostSuccess } from "@/lib/x-to-threads/on-post-success";
import type { SelectorsConfig } from "@/types/selectors";
import { YeetProgressStatus } from "@/types/settings";
import { BackgroundAction } from "@/types/messaging";

async function waitUntilTabVisible(): Promise<void> {
  if (document.visibilityState === "visible") return;

  await new Promise<void>((resolve) => {
    const onVis = () => {
      if (document.visibilityState === "visible") {
        document.removeEventListener("visibilitychange", onVis);
        resolve();
      }
    };
    document.addEventListener("visibilitychange", onVis);
  });
}

async function injectWithOptionalFocusRetry(
  text: string,
  composerSelector: string,
): Promise<boolean> {
  if (await askMainWorldToInject(text, composerSelector)) return true;

  console.warn(
    "[Yeet] Inject failed in background — focusing tab and retrying.",
  );
  await browser.runtime.sendMessage({ action: BackgroundAction.FOCUS_TAB });
  await waitUntilTabVisible();
  return askMainWorldToInject(text, composerSelector);
}

/**
 * On Threads intent tab (`?yeet_auto_post=true`):
 * wait for composer → MAIN Lexical inject → click Post → await success.
 */
export async function runThreadsAutoPost(
  selectors: SelectorsConfig,
): Promise<void> {
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.get("yeet_auto_post")) return;

  const pendingText = await getPendingText();
  if (!pendingText) {
    console.warn("[Yeet] Auto-post flag set but no pending text in storage.");
    return;
  }

  console.log("[Yeet] Auto-posting on Threads…");
  console.log("[Yeet] Pending text:", JSON.stringify(pendingText));

  await waitFor(() =>
    Boolean(document.querySelector(selectors.threads.composer)),
  );

  const injected = await injectWithOptionalFocusRetry(
    pendingText,
    selectors.threads.composer,
  );

  if (!injected) {
    console.error("[Yeet] Inject failed after focus retry.");
    await browser.storage.local.set({
      yeetProgress: { status: YeetProgressStatus.ERROR },
    });
    return;
  }

  await waitFor(() => isComposerReadyToPost(selectors, pendingText));

  console.log("[Yeet] Composer ready — posting.");
  listenForPostSuccess();

  const postButton = findPostButton(selectors);
  if (!postButton) {
    console.error("[Yeet] Post button missing at click time.");
    return;
  }
  postButton.click();
}
