import { YeetPageMessage } from "@/lib/x-to-threads/messages";

function extractPermalink(data: any): string | null {
  return (
    data?.media?.permalink ||
    data?.items?.[0]?.media?.permalink ||
    data?.permalink ||
    null
  );
}

function extractPostId(data: any): string | null {
  const media = data?.media || data?.items?.[0]?.media || data;
  const id =
    media?.pk ?? media?.id ?? media?.code ?? data?.pk ?? data?.id ?? null;
  return id != null ? String(id) : null;
}

/** Update these if Meta renames the create-post endpoints. */
function isPostEndpoint(url: string): boolean {
  return (
    url.includes("/api/v1/media/configure_text_only_post/") ||
    url.includes("/api/v1/media/configure_text_post_app_feed/")
  );
}

function emitSuccess(data: any) {
  const permalink = extractPermalink(data);
  const postId = extractPostId(data);
  if (!permalink && !postId) return;

  console.log("[Yeet] Intercepted post:", { permalink, postId });
  window.postMessage(
    { type: YeetPageMessage.POST_SUCCESS, permalink, postId },
    "*",
  );
}

/** Patch fetch/XHR to capture permalink + post id after Post. */
export function installPostApiWatcher(): void {
  const originalFetch = window.fetch;
  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);
    try {
      const url =
        typeof args[0] === "string"
          ? args[0]
          : (args[0] as Request | undefined)?.url;

      if (url && isPostEndpoint(url)) {
        console.log("[Yeet] Matched post endpoint:", url);
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
    ...rest: any[]
  ) {
    this.addEventListener("load", function () {
      if (typeof url === "string" && isPostEndpoint(url)) {
        try {
          emitSuccess(JSON.parse(this.responseText));
        } catch {
          // ignore
        }
      }
    });
    // @ts-ignore
    return originalOpen.apply(this, [method, url, ...rest]);
  };
}
