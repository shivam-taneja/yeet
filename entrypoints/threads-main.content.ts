export default defineContentScript({
  matches: ["*://*.threads.com/*", "*://*.threads.net/*"],
  world: "MAIN",
  runAt: "document_start",
  main() {
    console.log("[Yeet] MAIN world script active — fetch + inject ready.");

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

    function isPostEndpoint(url: string): boolean {
      return (
        url.includes("/api/v1/media/configure_text_only_post/") ||
        url.includes("/api/v1/media/configure_text_post_app_feed/")
      );
    }

    function tryEmit(data: any) {
      const permalink = extractPermalink(data);
      const postId = extractPostId(data);
      if (!permalink && !postId) return;
      console.log("[Yeet] Main world intercepted post:", { permalink, postId });
      window.postMessage({ type: "YEET_POST_SUCCESS", permalink, postId }, "*");
    }

    function textMatches(live: string, expected: string): boolean {
      return live === expected || live === expected + "\n";
    }

    function readLexicalPlainText(composer: HTMLElement): string {
      const paragraphs = Array.from(composer.querySelectorAll(":scope > p"));
      if (paragraphs.length > 0) {
        return paragraphs
          .map((p) => {
            const spans = p.querySelectorAll('[data-lexical-text="true"]');
            if (spans.length === 0) return "";
            let line = "";
            spans.forEach((span) => {
              line += span.textContent ?? "";
            });
            return line;
          })
          .join("\n");
      }
      return composer.innerText.replace(/\r\n/g, "\n");
    }

    /**
     * Threads ignores synthetic paste/execCommand (isTrusted / Lexical handlers).
     * Pull the live Lexical editor off React fiber and set state directly.
     */
    function findLexicalEditor(el: HTMLElement): any | null {
      const anyEl = el as any;
      if (anyEl.__lexicalEditor?.parseEditorState) return anyEl.__lexicalEditor;

      const propsKey = Object.keys(anyEl).find((k) =>
        k.startsWith("__reactProps$"),
      );
      if (propsKey) {
        const props = anyEl[propsKey];
        if (props?.editor?.parseEditorState) return props.editor;
      }

      const fiberKey = Object.keys(anyEl).find(
        (k) =>
          k.startsWith("__reactFiber$") ||
          k.startsWith("__reactInternalInstance$"),
      );
      let fiber = fiberKey ? anyEl[fiberKey] : null;
      let depth = 0;
      while (fiber && depth < 50) {
        const p = fiber.memoizedProps || fiber.pendingProps || {};
        if (p.editor?.parseEditorState) return p.editor;
        if (p.value?.editor?.parseEditorState) return p.value.editor;
        if (fiber.stateNode?.__lexicalEditor?.parseEditorState) {
          return fiber.stateNode.__lexicalEditor;
        }
        fiber = fiber.return;
        depth++;
      }

      // Walk parents — ContentEditable is often nested under LexicalComposer.
      let parent: HTMLElement | null = el.parentElement;
      let hops = 0;
      while (parent && hops < 10) {
        const found = findLexicalEditorShallow(parent);
        if (found) return found;
        parent = parent.parentElement;
        hops++;
      }

      return null;
    }

    function findLexicalEditorShallow(el: HTMLElement): any | null {
      const anyEl = el as any;
      if (anyEl.__lexicalEditor?.parseEditorState) return anyEl.__lexicalEditor;
      const propsKey = Object.keys(anyEl).find((k) =>
        k.startsWith("__reactProps$"),
      );
      if (propsKey) {
        const props = anyEl[propsKey];
        if (props?.editor?.parseEditorState) return props.editor;
        if (props?.value?.editor?.parseEditorState) return props.value.editor;
      }
      const fiberKey = Object.keys(anyEl).find(
        (k) =>
          k.startsWith("__reactFiber$") ||
          k.startsWith("__reactInternalInstance$"),
      );
      let fiber = fiberKey ? anyEl[fiberKey] : null;
      let depth = 0;
      while (fiber && depth < 30) {
        const p = fiber.memoizedProps || fiber.pendingProps || {};
        if (p.editor?.parseEditorState) return p.editor;
        if (p.value?.editor?.parseEditorState) return p.value.editor;
        fiber = fiber.return;
        depth++;
      }
      return null;
    }

    function buildEditorStateJSON(text: string) {
      const lines = text.split("\n");
      return {
        root: {
          children: lines.map((line) => ({
            children: line
              ? [
                  {
                    detail: 0,
                    format: 0,
                    mode: "normal",
                    style: "",
                    text: line,
                    type: "text",
                    version: 1,
                  },
                ]
              : [],
            direction: "ltr",
            format: "",
            indent: 0,
            type: "paragraph",
            version: 1,
          })),
          direction: "ltr",
          format: "",
          indent: 0,
          type: "root",
          version: 1,
        },
      };
    }

    function tryLexicalSetState(composer: HTMLElement, text: string): boolean {
      const editor = findLexicalEditor(composer);
      if (!editor) {
        console.warn("[Yeet] MAIN inject: Lexical editor instance not found on DOM/fiber.");
        return false;
      }

      console.log("[Yeet] MAIN inject: found Lexical editor, setEditorState…");
      try {
        const parsed = editor.parseEditorState(
          JSON.stringify(buildEditorStateJSON(text)),
        );
        editor.setEditorState(parsed);
        if (typeof editor.focus === "function") editor.focus();
        return textMatches(readLexicalPlainText(composer), text);
      } catch (err) {
        console.error("[Yeet] MAIN inject: setEditorState failed:", err);
        return false;
      }
    }

    function waitForText(
      composer: HTMLElement,
      expected: string,
    ): Promise<boolean> {
      return new Promise((resolve) => {
        if (textMatches(readLexicalPlainText(composer), expected)) {
          resolve(true);
          return;
        }

        const observer = new MutationObserver(() => {
          if (textMatches(readLexicalPlainText(composer), expected)) {
            observer.disconnect();
            resolve(true);
          }
        });

        observer.observe(composer, {
          childList: true,
          subtree: true,
          characterData: true,
        });

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (textMatches(readLexicalPlainText(composer), expected)) {
              observer.disconnect();
              resolve(true);
            } else {
              observer.disconnect();
              resolve(false);
            }
          });
        });
      });
    }

    async function injectText(
      composerSelector: string,
      text: string,
    ): Promise<boolean> {
      const composer = document.querySelector(
        composerSelector,
      ) as HTMLElement | null;
      if (!composer) {
        console.error(
          "[Yeet] MAIN inject: composer not found for",
          composerSelector,
        );
        return false;
      }

      console.log("[Yeet] MAIN inject target:", {
        selector: composerSelector,
        ariaLabel: composer.getAttribute("aria-label"),
        childHTML: composer.innerHTML.slice(0, 200),
      });

      // Primary path — Threads rejects synthetic paste/execCommand.
      console.log("[Yeet] MAIN inject trying: lexical-setEditorState");
      if (tryLexicalSetState(composer, text)) {
        console.log("[Yeet] MAIN inject landed via lexical-setEditorState");
        return true;
      }
      // React may flush async.
      if (await waitForText(composer, text)) {
        console.log(
          "[Yeet] MAIN inject landed via lexical-setEditorState (async)",
        );
        return true;
      }

      const live = readLexicalPlainText(composer);
      console.log("[Yeet] MAIN inject result:", {
        ok: false,
        live,
        expected: text,
        childHTML: composer.innerHTML.slice(0, 200),
      });
      return false;
    }

    window.addEventListener("message", (event: MessageEvent) => {
      if (event.source !== window) return;
      if (event.data?.type !== "YEET_INJECT_TEXT") return;

      const { text, composerSelector, requestId } = event.data as {
        text: string;
        composerSelector: string;
        requestId: string;
      };

      void injectText(composerSelector, text).then((ok) => {
        const el = document.querySelector(
          composerSelector,
        ) as HTMLElement | null;
        window.postMessage(
          {
            type: "YEET_INJECT_DONE",
            requestId,
            ok,
            liveText: el ? readLexicalPlainText(el) : "",
          },
          "*",
        );
      });
    });

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
