# Yeet Roadmap & TODOs

## Shipping now (text)

- [x] X → Threads and Threads → X text yeets (storage → inject → Post → permalink → close tab)
- [x] Post click + Cmd/Ctrl+Enter (incl. Threads inline reply arrow)
- [x] Character limits (Threads 500; X 280 / Premium 25k)
- [x] Settings matrix, progress UI, last-yeet link, reset to defaults
- [x] Body text via storage (no URL `?text=`) — links / OG behave normally

## Next

### Media

- [ ] **Images** — X → Threads first, then Threads → X. Known pitfalls:
  - Upload `ok` ≠ attached to draft
  - Background tabs drop previews; focused tab is more reliable
  - Don’t reset Lexical after attaching media
  - Prefer MAIN-world paste/drop over file-input `change`
  - Use chunked base64 (never huge `btoa(String.fromCharCode(...))`)
- [ ] **Videos / GIFs** — After images; unlock Preferences toggles

### Product

- [ ] **Thread continuation** — Both directions (settings row already “Soon”)
- [ ] **Retry destination only** — If source posts but destination fails

## Later / tech debt

- [ ] Drop `public/selectors.json` when legacy OTA consumers are gone
- [ ] Harden intent-tab composer ready-gate when media returns
- [ ] X Premium on bare intent tabs (cache from a normal x.com visit for now)
