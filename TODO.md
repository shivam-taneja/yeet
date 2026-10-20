# Yeet Roadmap & TODOs

## Shipping now

- [x] X → Threads and Threads → X **text** yeets (storage → inject → Post → permalink → close tab)
- [x] Post click + Cmd/Ctrl+Enter (incl. Threads inline reply arrow)
- [x] Character limits (Threads 500; X 280 / Premium 25k)
- [x] Settings matrix, progress UI, last-yeet link, reset to defaults
- [x] Body text via storage (no URL `?text=`) — links / OG behave normally
- [x] **Images (X → Threads)** — warm cache → storage → file-input attach → auto-Post in a background tab
  - Prefetch Files while composing (X revokes `blob:` on Post)
  - `input.files` + `change` (Crossposter-style); drop fallback
  - Data URLs via FileReader (no spread-`btoa` / no `fetch(data:)`)
  - Wait for durable `picture > blob:` preview + enabled Post before click

## Next

### Media

- [ ] **Images (Threads → X)** — Same attach pattern the other way
- [ ] **Videos / GIFs** — After images; unlock Preferences toggles

### Product

- [ ] **Thread continuation** — Both directions (settings row already “Soon”)
- [ ] **Retry destination only** — If source posts but destination fails

## Later / tech debt

- [ ] Drop `public/selectors.json` when legacy OTA consumers are gone
- [ ] X Premium on bare intent tabs (cache from a normal x.com visit for now)
