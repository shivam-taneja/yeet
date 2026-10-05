# Yeet Roadmap & TODOs

## Current status (text)

- [x] **X → Threads** — Capture → storage → Lexical inject → Post → permalink → close tab (`lib/x-to-threads/`)
- [x] **Threads → X** — Capture → storage → Draft inject on X intent → CreateTweet → close tab (`lib/threads-to-x/`)
- [x] **Background intent tabs** — Text-only yeets open inactive tabs
- [x] **Progress indicators + last-yeet link** — Popup shows yeeting / done + post URL
- [x] **Composer context toggles** — Matrix rules in options (both directions)

## Features in Pipeline

### Media & Attachments

- [ ] **Images (X → Threads)** — In progress / blocked. Learnings from the last attempt:
  - `/rupload_igphoto/` returning `ok` ≠ image attached to the draft (can still hit `configure_text_only_post`)
  - Background tabs often drop the media preview; focused tab is more reliable
  - Lexical `setEditorState` after attach can wipe media — order must be text then images (or never reset Lexical after media)
  - File-input `change` alone is unreliable; manual clipboard paste works — revisit MAIN-world paste/drop
  - Never encode image bytes with `btoa(String.fromCharCode(...hugeUint8))` (stack overflow) — use chunked base64
  - Need draft-level truth before Post (e.g. preview in DOM and/or `configure_text_post_app_feed`)
- [ ] **Videos / GIFs** — After images are stable
- [ ] **OG link unfurls** — Threads may not fetch OG in a background tab; posting without waiting on preview is OK for now

### Core Functionality

- [ ] **Thread continuation** — Detect an existing post and append when continuing a thread
- [ ] **Resilient retries** — If X succeeds but Threads fails, offer “retry Threads only” without double-posting X

### Bugs & Limitations

- [ ] **Verify @ mentions** — Old URL-intent path stripped `@` if Post fired too early; Lexical inject may have fixed this — re-test
- [ ] **Verify emoji** — Old URL encoding could corrupt emoji; re-test on Lexical path
- [ ] **Composer flash / remount** — Intent page sometimes mounts a throwaway composer then replaces it; ready-gate (live Lexical editor + stable node) still worth hardening when media returns

### Tech Debt & Cleanup

- [ ] **Delete `public/selectors.json`** — Once older store builds that still fetch it are fully retired
- [ ] **Preferences / clear stuck state** — Optional: clear pending yeet + reset `chrome.storage.local` from options (useful when debugging)

## Done (recent)

- [x] Modular `lib/x-to-threads/` flow (capture → inject → network watch → close)
- [x] Drop URL `?text=` intent for body text (storage + Lexical instead)
- [x] Strip Threads → X dead code and dual-column options matrix
- [x] Progress UI + clickable last yeet link
