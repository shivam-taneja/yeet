import { browser } from "wxt/browser";
import { getPendingText } from "@/lib/cross-post/pending-text";
import { getPendingImages } from "@/lib/cross-post/pending-images";
import { claimYeetHandoff } from "@/lib/cross-post/yeet-handoff";
import {
  waitFor,
  waitForTimeout,
  waitForSettledNode,
  waitForSettledTrue,
  sleep,
} from "@/lib/x-to-threads/wait-for";
import { askMainWorldToInject } from "@/lib/cross-post/ask-main-to-inject";
import { askMainWorldToAttachImages } from "@/lib/cross-post/ask-main-to-attach";
import {
  findPostButton,
  isComposerReadyToPost,
  isPostButtonReady,
  composerHasExactText,
} from "@/lib/threads-to-x/composer-ui";
import {
  findXFileInput,
  composerHasMediaPreview,
} from "@/lib/threads-to-x/attach-media";
import { listenForPostSuccess } from "@/lib/threads-to-x/on-post-success";
import { getXCharacterLimitForYeet } from "@/lib/x/premium";
import { formatOverLimitMessage } from "@/lib/character-limits";
import type { SelectorsConfig } from "@/types/selectors";
import { YeetProgressStatus } from "@/types/settings";
import { BackgroundAction } from "@/types/messaging";
import type { PendingImage } from "@/lib/cross-post/pending-images";

const FILE_INPUT_WAIT_MS = 15_000;
const COMPOSER_SETTLE_MS = 800;
const COMPOSER_SETTLE_TIMEOUT_MS = 20_000;
const PREVIEW_SETTLE_MS = 500;
const PREVIEW_APPEAR_TIMEOUT_MS = 12_000;
const PREVIEW_STICK_TIMEOUT_MS = 8_000;
const READY_GATE_TIMEOUT_MS = 20_000;
const ATTACH_ATTEMPTS = 3;

function probeFilesForAccept(images: PendingImage[]): File[] {
  return images.map(
    (img) =>
      new File([new Uint8Array([0])], img.name || "yeet.jpg", {
        type: img.mimeType || "image/jpeg",
      }),
  );
}

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

async function focusTab(): Promise<void> {
  await browser.runtime.sendMessage({ action: BackgroundAction.FOCUS_TAB });
  await waitUntilTabVisible();
}

async function injectWithOptionalFocusRetry(
  text: string,
  composerSelector: string,
  { allowFocus = true }: { allowFocus?: boolean } = {},
): Promise<boolean> {
  if (await askMainWorldToInject(text, composerSelector)) return true;

  if (!allowFocus) {
    console.warn(
      "[Yeet] Inject failed in background tab — not focusing (media path).",
    );
    return false;
  }

  console.warn(
    "[Yeet] Inject failed in background — focusing tab and retrying.",
  );
  await focusTab();
  return askMainWorldToInject(text, composerSelector);
}

async function waitForStableMediaComposer(
  selectors: SelectorsConfig,
  images: PendingImage[],
): Promise<boolean> {
  await waitFor(() => Boolean(document.querySelector(selectors.x.composer)));

  const settled = await waitForSettledNode(
    () => document.querySelector(selectors.x.composer),
    COMPOSER_SETTLE_MS,
    COMPOSER_SETTLE_TIMEOUT_MS,
  );
  if (!settled) {
    console.warn("[Yeet] X composer never settled before timeout.");
    return false;
  }

  const probeFiles = probeFilesForAccept(images);
  const inputReady = await waitForTimeout(
    () => Boolean(findXFileInput(selectors.x.composer, probeFiles)),
    FILE_INPUT_WAIT_MS,
  );
  if (!inputReady) {
    console.warn("[Yeet] X file input never appeared on settled composer.");
    return false;
  }

  await sleep(400);

  const stillSettled = await waitForSettledNode(
    () => document.querySelector(selectors.x.composer),
    400,
    5_000,
  );
  return Boolean(stillSettled);
}

async function ensureTextLanded(
  selectors: SelectorsConfig,
  text: string,
): Promise<boolean> {
  let injected = await injectWithOptionalFocusRetry(
    text,
    selectors.x.composer,
    { allowFocus: false },
  );
  if (!injected) return false;

  await sleep(350);
  if (composerHasExactText(selectors, text)) return true;

  console.warn("[Yeet] Text vanished after inject — settling and retrying.");
  await waitForSettledNode(
    () => document.querySelector(selectors.x.composer),
    COMPOSER_SETTLE_MS,
    10_000,
  );
  injected = await askMainWorldToInject(text, selectors.x.composer);
  if (!injected) return false;
  await sleep(350);
  return composerHasExactText(selectors, text);
}

async function attachUntilPreviewSticks(
  images: PendingImage[],
  composerSelector: string,
): Promise<number> {
  const probeFiles = probeFilesForAccept(images);
  let lastInserted = 0;

  for (let attempt = 1; attempt <= ATTACH_ATTEMPTS; attempt++) {
    await waitForSettledNode(
      () => document.querySelector(composerSelector),
      attempt === 1 ? 300 : COMPOSER_SETTLE_MS,
      10_000,
    );
    await waitForTimeout(
      () => Boolean(findXFileInput(composerSelector, probeFiles)),
      5_000,
    );

    const result = await askMainWorldToAttachImages(images, composerSelector);
    lastInserted = result.mediaInserted;
    console.log(
      `[Yeet] Attach attempt ${attempt}/${ATTACH_ATTEMPTS}: inserted=${lastInserted}`,
    );

    if (lastInserted === 0) {
      await sleep(300);
      continue;
    }

    const appeared = await waitForTimeout(
      () => composerHasMediaPreview(composerSelector),
      PREVIEW_APPEAR_TIMEOUT_MS,
    );
    if (!appeared) {
      console.warn(
        "[Yeet] No media preview appeared in DOM after attach — retrying.",
      );
      continue;
    }

    const stuck = await waitForSettledTrue(
      () => composerHasMediaPreview(composerSelector),
      PREVIEW_SETTLE_MS,
      PREVIEW_STICK_TIMEOUT_MS,
    );

    if (stuck) {
      console.log("[Yeet] Media preview stuck in DOM — attach looked durable.");
      return lastInserted;
    }

    console.warn(
      "[Yeet] Preview appeared then disappeared (composer remount?) — retrying attach.",
    );
  }

  return composerHasMediaPreview(composerSelector) ? lastInserted : 0;
}

type MediaReadyGate = {
  previewOk: boolean;
  postButtonFound: boolean;
  postButtonReady: boolean;
};

function readMediaReadyGate(selectors: SelectorsConfig): MediaReadyGate {
  const button = findPostButton(selectors);
  return {
    previewOk: composerHasMediaPreview(selectors.x.composer),
    postButtonFound: Boolean(button),
    postButtonReady: isPostButtonReady(button),
  };
}

async function waitForMediaReadyGate(
  selectors: SelectorsConfig,
  timeoutMs: number,
): Promise<MediaReadyGate> {
  const ready = await waitForTimeout(() => {
    const gate = readMediaReadyGate(selectors);
    return gate.previewOk && gate.postButtonReady;
  }, timeoutMs);

  const gate = readMediaReadyGate(selectors);
  console.log(
    "[Yeet] Media ready gate:",
    ready ? "met" : "timed out",
    gate,
  );
  return gate;
}

/**
 * On X intent (`?yeet_auto_post` or storage handoff):
 * Text-only: inject → auto-click Post.
 * With images: inject → attach → wait for preview+Post ready → auto-click Post.
 */
export async function runXAutoPost(selectors: SelectorsConfig): Promise<void> {
  const urlFlag = new URLSearchParams(window.location.search).get(
    "yeet_auto_post",
  );
  const handoff = await claimYeetHandoff();

  if (!handoff && !urlFlag) return;

  const [pendingText, pendingImages] = await Promise.all([
    getPendingText(),
    getPendingImages(),
  ]);

  if (!pendingText && pendingImages.length === 0) {
    console.warn(
      "[Yeet] Handoff claimed but no pending text or images in storage.",
    );
    return;
  }

  if (pendingText) {
    const limit = await getXCharacterLimitForYeet();
    if (pendingText.length > limit) {
      alert(formatOverLimitMessage("X", limit));
      await browser.storage.local.set({
        yeetProgress: { status: YeetProgressStatus.ERROR },
      });
      browser.runtime.sendMessage({ action: BackgroundAction.CLOSE_TAB });
      return;
    }
  }

  const hasMedia = pendingImages.length > 0;

  console.log("[Yeet] Auto-posting on X…");
  console.log("[Yeet] Handoff:", handoff ?? `(url flag only: ${urlFlag})`);
  console.log("[Yeet] Pending text:", JSON.stringify(pendingText ?? ""));
  console.log("[Yeet] Pending images:", pendingImages.length);

  if (hasMedia) {
    const stable = await waitForStableMediaComposer(selectors, pendingImages);
    if (!stable) {
      console.error("[Yeet] X composer never became stable for media.");
      await browser.storage.local.set({
        yeetProgress: { status: YeetProgressStatus.ERROR },
      });
      return;
    }

    if (pendingText) {
      const textOk = await ensureTextLanded(selectors, pendingText);
      if (!textOk) {
        console.error("[Yeet] Text inject failed on settled composer.");
        await browser.storage.local.set({
          yeetProgress: { status: YeetProgressStatus.ERROR },
        });
        return;
      }
    }

    const mediaInserted = await attachUntilPreviewSticks(
      pendingImages,
      selectors.x.composer,
    );

    if (mediaInserted === 0) {
      console.error("[Yeet] Failed to keep images attached on X.");
      await browser.storage.local.set({
        yeetProgress: { status: YeetProgressStatus.ERROR },
      });
      return;
    }

    if (pendingText && !composerHasExactText(selectors, pendingText)) {
      console.warn(
        "[Yeet] Text missing after media attach (remount). Leaving media; type caption if needed.",
      );
    }

    console.log(
      `[Yeet] ${mediaInserted} image(s) attached — waiting for Post enabled…`,
    );

    const readyGate = await waitForMediaReadyGate(
      selectors,
      READY_GATE_TIMEOUT_MS,
    );

    if (!readyGate.previewOk || !readyGate.postButtonReady) {
      console.error(
        "[Yeet] Media ready gate failed — leaving tab for manual Post.",
        readyGate,
      );
      await browser.storage.local.set({
        yeetProgress: {
          status: YeetProgressStatus.YEETING,
          awaitingManualPost: true,
        },
      });
      listenForPostSuccess();
      return;
    }

    const postButton = findPostButton(selectors);
    if (!postButton) {
      console.error("[Yeet] Post button missing at click time (media).");
      await browser.storage.local.set({
        yeetProgress: {
          status: YeetProgressStatus.YEETING,
          awaitingManualPost: true,
        },
      });
      listenForPostSuccess();
      return;
    }

    console.log("[Yeet] Media ready — auto-clicking Post.");
    listenForPostSuccess();
    postButton.click();
    return;
  }

  // Text-only path
  await waitFor(() => Boolean(document.querySelector(selectors.x.composer)));

  if (pendingText) {
    const injected = await injectWithOptionalFocusRetry(
      pendingText,
      selectors.x.composer,
    );

    if (!injected) {
      console.error("[Yeet] Inject failed after focus retry.");
      await browser.storage.local.set({
        yeetProgress: { status: YeetProgressStatus.ERROR },
      });
      return;
    }

    await waitFor(() => isComposerReadyToPost(selectors, pendingText));
  }

  console.log("[Yeet] Composer ready — posting.");
  listenForPostSuccess();

  const postButton = findPostButton(selectors);
  if (!postButton) {
    console.error("[Yeet] Post button missing at click time.");
    return;
  }
  postButton.click();
}
