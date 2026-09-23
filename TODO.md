# Yeet Roadmap & TODOs

## Features in Pipeline

- [ ] **Images** — yeet attached photos from the X composer to Threads, and the other way
- [ ] **Videos** — same for video / GIF attachments
- [ ] **Thread continuation** — detect an existing Threads post and append to it when continuing a thread on X
- [ ] **Resilient Retries** — Track cross-post status for each platform. If X posts but Threads fails, show a "retry failed only" option to prevent accidental double-posts on the platform that succeeded.
- [x] **Clickable post link** — Add a clickable link in the popup for the post that was just yeeted, allowing one-click navigation to the destination post on either platform.
- [ ] **Fix @ mentions stripping** — Threads intent auto-post strips the @ symbol from mentions because the post button is clicked before Lexical finishes parsing it. Needs a robust fix that doesn't involve arbitrary timeouts.
- [ ] **Emoji encoding** — Emojis (e.g., 👀) are sometimes corrupted into when cross-posting to Threads. Likely an issue with URL encoding/decoding or Lexical editor parsing.
- [ ] **Fix OG link unfurls** — When yeeting a link (e.g., domain.com), X instantly renders the OG image, but Threads requires time to fetch it. _(Known limitation: Chrome pauses rendering on background tabs, so if Yeet opens Threads in the background, Lexical will literally never fetch the OG preview until the tab is focused. We've opted to just post instantly without the preview to maintain background speed.)_
- [ ] **Threads → X cross-posting** (blocked) — The click/keydown interception is unreliable. Threads' heavily obfuscated DOM makes it hard to consistently find the active composer when the Post button is clicked inside modals. Root causes: (1) context is "unknown" for button clicks because the MutationObserver tags editors asynchronously and loses the race; (2) when multiple composers exist in the DOM (modal + background feed), picking the right one by text content is flaky. Needs a fundamentally different approach — likely hooking into Lexical's internal state instead of reading from the DOM. Re-enable `handleThreadsPostClick`, `handleThreadsPostKeydown`, and `observeAndTagThreadsComposers` in `entrypoints/threads.content.ts` once resolved.
- [x] **Threads Context & Constraints** — Implement robust context detection (new post, reply, quote, etc.) and state checks for Threads, matching the robustness of the logic built for X.
