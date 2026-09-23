export default defineContentScript({
  matches: ["*://*.threads.com/*", "*://*.threads.net/*"],
  world: "MAIN",
  main() {
    // Intercept Fetch requests to grab the Threads post URL from the API response
    const originalFetch = window.fetch;
    window.fetch = async function (...args) {
      const response = await originalFetch.apply(this, args);
      try {
        const url =
          typeof args[0] === "string"
            ? args[0]
            : (args[0] as Request | undefined)?.url;

        if (url && url.includes("/api/v1/media/configure_text_only_post/")) {
          response
            .clone()
            .json()
            .then((data) => {
              if (data?.media?.permalink) {
                console.log(
                  "[Yeet] Main world intercepted post URL:",
                  data.media.permalink,
                );
                window.postMessage(
                  {
                    type: "YEET_POST_SUCCESS",
                    permalink: data.media.permalink,
                  },
                  "*",
                );
              }
            })
            .catch((e) => console.error("[Yeet] Failed to parse response", e));
        }
      } catch (e) {
        // ignore
      }
      return response;
    };

    // Also intercept XMLHttpRequest just in case Threads falls back to it
    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (
      method: string,
      url: string | URL,
      ...rest: any[]
    ) {
      this.addEventListener("load", function () {
        if (
          typeof url === "string" &&
          url.includes("/api/v1/media/configure_text_only_post/")
        ) {
          try {
            const data = JSON.parse(this.responseText);
            if (data?.media?.permalink) {
              console.log(
                "[Yeet] Main world XHR intercepted post URL:",
                data.media.permalink,
              );
              window.postMessage(
                {
                  type: "YEET_POST_SUCCESS",
                  permalink: data.media.permalink,
                },
                "*",
              );
            }
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
