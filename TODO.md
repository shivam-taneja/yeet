# Yeet Roadmap & TODOs

## Shipping now

- [x] X → Threads and Threads → X **text** yeets (storage → inject → Post → permalink → close tab)
- [x] Post click + Cmd/Ctrl+Enter (incl. Threads inline reply arrow)
- [x] Character limits (Threads 500; X 280 / Premium 25k)
- [x] Settings matrix, progress UI, last-yeet link, reset to defaults
- [x] Body text via storage (no URL `?text=`) — links / OG behave normally
- [x] **Images (X → Threads)** — warm cache → storage → file-input attach → auto-Post in a background tab
  - Prefetch `File`s from the **composer shell only** (never timeline / feed media)
  - Skip yeet when video/GIF is attached (not supported yet); alert + leave X post alone
  - `input.files` + `change`; drop fallback if no file input
  - Data URLs via FileReader (no spread-`btoa` / no `fetch(data:)`)
  - Wait for durable `picture > blob:` preview + enabled Post before click

## Next

### Media

- [ ] **Images (Threads → X)** — Capture on Threads → stash → attach on X intent (mirror X → Threads)
- [ ] **Videos / GIFs** — After images; unlock Preferences toggles

### Product

- [ ] **Thread continuation** — Both directions (settings row already “Soon”)
- [ ] **Retry destination only** — If source posts but destination fails

## Later / tech debt

- [ ] Drop `public/selectors.json` when legacy OTA consumers are gone
- [ ] X Premium on bare intent tabs (cache from a normal x.com visit for now)
