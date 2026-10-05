import { YeetPageMessage } from "@/lib/cross-post/messages";

function extractTweetId(data: any): string | null {
  const id =
    data?.data?.create_tweet?.tweet_results?.result?.rest_id ??
    data?.data?.create_tweet?.tweet_results?.result?.legacy?.id_str ??
    data?.data?.notetweet_create?.tweet_results?.result?.rest_id ??
    null;
  return id != null ? String(id) : null;
}

function isCreateTweetEndpoint(url: string): boolean {
  return url.includes("CreateTweet") || url.includes("/2/tweet/create");
}

function emitSuccess(data: any) {
  const postId = extractTweetId(data);
  if (!postId) return;

  const permalink = `https://x.com/i/web/status/${postId}`;
  console.log("[Yeet] Intercepted X post:", { permalink, postId });
  window.postMessage(
    { type: YeetPageMessage.POST_SUCCESS, permalink, postId },
    "*",
  );
}

/** Patch fetch/XHR to capture tweet id after Post on X. */
export function installCreateTweetWatcher(): void {
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);
    try {
      const url =
        typeof args[0] === "string"
          ? args[0]
          : (args[0] as Request | undefined)?.url;

      if (url && isCreateTweetEndpoint(url)) {
        console.log("[Yeet] Matched CreateTweet endpoint:", url);
        response
          .clone()
          .json()
          .then(emitSuccess)
          .catch(() => {});
      }
    } catch {
      // ignore
    }
    return response;
  };

  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (
    method: string,
    url: string | URL,
    ...rest: unknown[]
  ) {
    this.addEventListener("load", function () {
      if (typeof url === "string" && isCreateTweetEndpoint(url)) {
        try {
          emitSuccess(JSON.parse(this.responseText));
        } catch {
          // ignore
        }
      }
    });
    // @ts-expect-error legacy XHR open signature
    return originalOpen.apply(this, [method, url, ...rest]);
  };
}
