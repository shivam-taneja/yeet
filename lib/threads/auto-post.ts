import { browser } from "wxt/browser";
import { extractTextFromLexicalEditor } from "@/lib/dom-utils";
import { getPendingText, clearPendingText } from "@/lib/pending-text";
import { waitFor } from "@/lib/wait-for";
import type { SelectorsConfig } from "@/types/selectors";
import { YeetProgressStatus } from "@/types/settings";
import { BackgroundAction } from "@/types/messaging";

function findPostButton(
  selectors: SelectorsConfig,
  root: ParentNode = document,
): HTMLElement | null {
  const composer =
    (root as Document | Element).querySelector?.(selectors.threads.composer) ??
    document.querySelector(selectors.threads.composer);
  const container =
    (composer instanceof Element && composer.closest('[role="dialog"]')) ||
    document;

  const buttons = Array.from(
    container.querySelectorAll(selectors.threads.postButton),
  );

  return (
    (buttons.find((btn) => btn.textContent?.toLowerCase().trim() === "post") as
      | HTMLElement
      | undefined) ?? null
  );
}

function isPostButtonReady(button: HTMLElement | null): boolean {
  if (!button) return false;
  if (button.getAttribute("aria-disabled") === "true") return false;
  if (button.hasAttribute("disabled")) return false;
  return true;
}

function isMentionTypeaheadOpen(): boolean {
  return Boolean(
    document.querySelector(
      '[role="listbox"], [role="combobox"][aria-expanded="true"]',
    ),
  );
}

/** Lexical often exposes a trailing newline in innerText for the last block. */
function textLanded(live: string, expected: string): boolean {
  return live === expected || live === expected + "\n";
}

function requestMainWorldInject(
  text: string,
  composerSelector: string,
): Promise<boolean> {
  const requestId = `yeet-inject-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return new Promise((resolve) => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      if (event.data?.type !== "YEET_INJECT_DONE") return;
      if (event.data.requestId !== requestId) return;

      window.removeEventListener("message", onMessage);
      console.log("[Yeet] MAIN inject done:", event.data);
      resolve(Boolean(event.data.ok));
    };

    window.addEventListener("message", onMessage);
    window.postMessage(
      {
        type: "YEET_INJECT_TEXT",
        requestId,
        text,
        composerSelector,
      },
      "*",
    );
  });
}

function setupPostSuccessListener(): void {
  const messageListener = (event: MessageEvent) => {
    if (event.data?.type !== "YEET_POST_SUCCESS") return;

    const { permalink, postId } = event.data as {
      permalink?: string;
      postId?: string;
    };

    if (!permalink && !postId) return;

    console.log("[Yeet] Post success intercepted:", { permalink, postId });
    window.removeEventListener("message", messageListener);

    // Clear only after we have the link — keep pending text if post fails mid-way.
    void clearPendingText();

    browser.storage.local.get(["lastYeet"]).then((res) => {
      const lastYeet = res.lastYeet
        ? {
            ...res.lastYeet,
            ...(permalink ? { postUrl: permalink } : {}),
            ...(postId ? { postId } : {}),
          }
        : null;

      browser.storage.local.set({
        ...(lastYeet ? { lastYeet } : {}),
        yeetProgress: { status: YeetProgressStatus.DONE },
      });

      console.log("[Yeet] Closing tab.");
      browser.runtime.sendMessage({ action: BackgroundAction.CLOSE_TAB });
    });
  };

  window.addEventListener("message", messageListener);
}

export async function handleThreadsAutoPost(
  selectors: SelectorsConfig,
): Promise<void> {
  const urlParams = new URLSearchParams(window.location.search);
  if (!urlParams.get("yeet_auto_post")) return;

  const pendingText = await getPendingText();
  if (!pendingText) {
    console.warn("[Yeet] Auto-post flag set but no pending text in storage.");
    return;
  }

  // Keep pendingYeetText until YEET_POST_SUCCESS (see setupPostSuccessListener).
  console.log("[Yeet] Auto-posting on Threads (storage → MAIN-world inject)...");
  console.log("[Yeet] Pending text:", JSON.stringify(pendingText));

  await waitFor(() =>
    Boolean(document.querySelector(selectors.threads.composer)),
  );

  const composerEl = document.querySelector(
    selectors.threads.composer,
  ) as HTMLElement | null;
  console.log("[Yeet] Composer matched:", {
    selector: selectors.threads.composer,
    found: Boolean(composerEl),
    ariaLabel: composerEl?.getAttribute("aria-label"),
    ariaPlaceholder: composerEl?.getAttribute("aria-placeholder"),
    outerHTML: composerEl?.outerHTML?.slice(0, 200),
  });

  const injected = await requestMainWorldInject(
    pendingText,
    selectors.threads.composer,
  );

  if (!injected) {
    // Bg tabs can refuse focus/input — focus once, then retry inject.
    console.warn(
      "[Yeet] Inject failed in background — focusing tab and retrying.",
    );
    await browser.runtime.sendMessage({ action: BackgroundAction.FOCUS_TAB });
    await new Promise<void>((resolve) => {
      if (document.visibilityState === "visible") {
        resolve();
        return;
      }
      const onVis = () => {
        if (document.visibilityState === "visible") {
          document.removeEventListener("visibilitychange", onVis);
          resolve();
        }
      };
      document.addEventListener("visibilitychange", onVis);
    });
    const retried = await requestMainWorldInject(
      pendingText,
      selectors.threads.composer,
    );
    if (!retried) {
      console.error("[Yeet] Inject failed after focus retry.");
      await browser.storage.local.set({
        yeetProgress: { status: YeetProgressStatus.ERROR },
      });
      return;
    }
  }

  await waitFor(() => {
    const liveComposer = document.querySelector(
      selectors.threads.composer,
    ) as HTMLElement | null;
    if (!liveComposer) return false;

    if (!textLanded(extractTextFromLexicalEditor(liveComposer), pendingText)) {
      return false;
    }
    if (isMentionTypeaheadOpen()) return false;

    return isPostButtonReady(findPostButton(selectors));
  });

  console.log("[Yeet] Composer ready — posting.");
  setupPostSuccessListener();

  const postButton = findPostButton(selectors);
  if (!postButton) {
    console.error("[Yeet] Post button missing at click time.");
    return;
  }
  postButton.click();
}
