export default defineContentScript({
  matches: ["*://*.threads.com/*", "*://*.threads.net/*"],
  world: "MAIN",
  runAt: "document_start",
  main() {
    console.log("[Yeet] MAIN world script active — fetch patched.");
    function extractPermalink(data: any): string | null {
      return (
        data?.media?.permalink ||
        data?.items?.[0]?.media?.permalink ||
        data?.permalink ||
        null
      );
    }

    function isPostEndpoint(url: string): boolean {
      return (
        url.includes("/api/v1/media/configure_text_only_post/") ||
        url.includes("/api/v1/media/configure_text_post_app_feed/")
      );
    }

    function tryEmit(data: any) {
      const permalink = extractPermalink(data);
      if (permalink) {
        console.log("[Yeet] Main world intercepted post URL:", permalink);
        window.postMessage({ type: "YEET_POST_SUCCESS", permalink }, "*");
      }
    }

    // Intercept Fetch
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
            .then(tryEmit)
            .catch(() => {});
        }
      } catch (e) {
        // ignore
      }
      return response;
    };

    // Intercept XHR fallback
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string | URL,
      ...rest: any[]
    ) {
      this.addEventListener("load", function () {
        if (typeof url === "string" && isPostEndpoint(url)) {
          try {
            tryEmit(JSON.parse(this.responseText));
          } catch (e) {
            // ignore
          }
        }
      });
      // @ts-ignore
      return originalOpen.apply(this, [method, url, ...rest]);
    };
  },
});
