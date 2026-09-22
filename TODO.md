# Yeet Roadmap & TODOs

## Features in Pipeline

- [ ] **Images** — yeet attached photos from the X composer to Threads, and the other way
- [ ] **Videos** — same for video / GIF attachments
- [ ] **Thread continuation** — detect an existing Threads post and append to it when continuing a thread on X
- [ ] **Resilient Retries** — Track cross-post status for each platform. If X posts but Threads fails, show a "retry failed only" option to prevent accidental double-posts on the platform that succeeded.
- [ ] **Clickable post link** — Add a clickable link in the popup for the post that was just yeeted, allowing one-click navigation to the destination post on either platform.
- [ ] **Fix @ mentions stripping** — Threads intent auto-post strips the @ symbol from mentions because the post button is clicked before Lexical finishes parsing it. Needs a robust fix that doesn't involve arbitrary timeouts.
- [ ] **Fix OG link unfurls** — When yeeting a link (e.g., domain.com), X instantly renders the OG image, but Threads requires time to fetch it. The auto-clicker fires too fast and posts plain text.
- [ ] **Threads Context & Constraints** — Implement robust context detection (new post, reply, quote, etc.) and state checks for Threads, matching the robustness of the logic built for X.
