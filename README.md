# Yeet

Yeet is a powerful browser extension that enables seamless, bidirectional cross-posting between X (formerly Twitter) and Threads. Built by [Shivam Taneja](https://github.com/shivam-taneja).

Website: [yeet.shivamtaneja.com](https://yeet.shivamtaneja.com/)
Website Source Code: [shivam-taneja/yeet-web](https://github.com/shivam-taneja/yeet-web)
Install: [Chrome Web Store](https://chromewebstore.google.com/detail/knbfidiiikhjebpijhafdikkjhbgbefe)

## Demo

https://github.com/user-attachments/assets/1b7b4be9-996c-411b-a182-0f14d98a52e6

## Features

- Bidirectional **text + images** cross-posting (X ↔ Threads).
- Enable **Copy Images** in Settings; yeets run in a **background tab** and auto-Post.
- Works from popup composers, feed posts, and inline reply bars (Post click + Cmd/Ctrl + Enter).
- Respects destination character limits (Threads 500; X 280 free / 25,000 Premium via sidebar detection).
- Per-direction composer rules in Settings (new posts always on; mention / quote / reply toggles; thread continuation coming soon).
- Real-time progress indicators when yeeting, plus a clickable last-yeet link in the popup.
- Global pause/resume toggle and **Reset everything to default** in Settings.
- Copy Videos / GIFs toggles are visible but locked until that support ships.

## TODO / Roadmap

See [TODO.md](./TODO.md) for what’s next (videos/GIFs, thread continuation, retries, etc.).

## How it works

1. **Capture** on the source platform when you Post (or Cmd/Ctrl + Enter).
2. **Stash** text (and images, if enabled) in extension storage — nothing goes in the intent URL.
3. Open a **background intent tab** on the destination (`?yeet_auto_post=true`).
4. **MAIN-world inject** — Lexical on Threads, Draft.js on X; images via native `input[type=file]` + `change`.
5. Click Post (after media preview is durable when images are present), watch the create-post API for permalink/id, then close the tab.

### Images (X ↔ Threads)

Both platforms revoke composer `blob:` URLs on Post, so Yeet **warm-caches** image `File`s while you compose — scoped to the **compose shell** only (never feed media). On the destination it attaches via the native file input + `change`, waits until a media preview sticks and Post is enabled, then auto-clicks Post in a background tab.

Videos / GIFs are not copied yet — Yeet skips the cross-post with an alert; your source post still goes through. X is capped at 4 images per post.

| Direction   | Capture                      | Inject / attach                              | Success watch                  |
| ----------- | ---------------------------- | -------------------------------------------- | ------------------------------ |
| X → Threads | Draft.js + warm image cache  | Lexical + file input (`threads-main`)        | Threads configure*text*\* APIs |
| Threads → X | Lexical + warm image cache   | Draft.js + `fileInput` (`x-main`)            | X `CreateTweet`                |

## Project Structure

```text
.
├── assets/                  # Static assets like fonts, icons, and tailwind.css
├── components/              # React components (Popup UI, Options, Shared UI)
├── entrypoints/             # WXT Entrypoints
│   ├── background.ts        # Background service worker (tabs)
│   ├── options/             # Options page
│   ├── popup/               # Popup page
│   ├── threads.content.ts   # Threads isolated (capture + warm cache + X→Threads auto-post)
│   ├── threads-main.content.ts  # Threads MAIN (Lexical inject + media attach + fetch patch)
│   ├── x.content.ts         # X isolated (capture + warm cache + Threads→X auto-post)
│   └── x-main.content.ts    # X MAIN (Draft inject + media attach + CreateTweet watch)
├── hooks/                   # Shared React hooks (e.g. use-settings.ts)
├── lib/                     # Core business logic
│   ├── character-limits.ts  # Shared destination character limits
│   ├── settings-defaults.ts # Default settings + reset source of truth
│   ├── cross-post/          # Pending text/images, handoff, MAIN inject/attach bridge
│   ├── threads-to-x/        # Threads → X flow (text + images, warm cache, attach)
│   ├── x-to-threads/        # X → Threads flow (text + images, warm cache, attach)
│   ├── threads/             # Threads handlers, contexts, post-button detection
│   ├── x/                   # X handlers, contexts, Premium cache
│   ├── constants.ts         # Fallback selectors + merge helper
│   ├── dom-utils.ts         # Draft.js / Lexical text extraction
│   └── selectors.json       # Bundled UI selectors + feature flags
└── types/                   # TypeScript type definitions
```

## Setup & Development

Yeet is built using [WXT](https://wxt.dev/) (Next-gen Web Extension Framework) and Vite.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed along with `pnpm`.

```bash
npm install -g pnpm
```

### Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/shivam-taneja/yeet.git
cd yeet
pnpm install
```

### Running Locally

To start the development server with hot-module replacement (HMR), run:

```bash
pnpm dev
```

This will automatically build the extension into the `.output/chrome-mv3-dev` directory.

### Environment Variables

Copy `.env.example` to `.env` before running locally:

```bash
cp .env.example .env
```

| Variable        | Values           | Description                                                                                                                                    |
| --------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_DEV_MODE` | `true` / `false` | When `true`, the destination tab is not opened — pending text is still saved and logged. Set to `true` while developing to avoid double posts. |

### Loading the Extension

#### Chrome, Brave, and Edge (Windows & Mac)

1. Open your browser and navigate to the extensions page:
   - **Chrome**: `chrome://extensions/`
   - **Brave**: `brave://extensions/`
   - **Edge**: `edge://extensions/`
2. Turn on **Developer mode** (usually a toggle in the top right corner or bottom left corner).
3. Click **Load unpacked**.
4. Select the `.output/chrome-mv3-dev` folder from your cloned `yeet` project directory.
5. The extension is now loaded and will automatically refresh when you make code changes!

## Releasing

Yeet uses a fully automated GitHub Actions pipeline for building and releasing updates.
To create a new release with downloadable `.zip` files for Chrome and Firefox, simply run:

```bash
pnpm version patch  # (use 'minor' or 'major' for larger updates)
git push --follow-tags
```

This will automatically:

1. Bump the version inside `package.json` and create a Git commit.
2. Create a new version tag (e.g., `v1.2.6`).
3. Push to GitHub and trigger the automated workflow.
4. Build the extension zips and attach them to a brand new GitHub Release page with an auto-generated changelog!

## Contributing

Contributions are welcome! If you'd like to help improve Yeet, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bug fix (`git checkout -b feature-name`).
3. Make your changes.
4. Ensure your code passes the build step (`pnpm build`).
5. Commit your changes (`git commit -m 'Add some feature'`).
6. Push to the branch (`git push origin feature-name`).
7. Open a Pull Request.

When X or Threads change their UI, update the selectors in `lib/selectors.json` (imported by `lib/constants.ts`) and ship a new extension build. Don’t hardcode platform selectors in content scripts.

Feature flags in `selectors.json`:

- `features.xToThreads` — gate X → Threads
- `features.threadsToX` — gate Threads → X

## License

MIT. See [LICENSE](LICENSE).
