# Yeet

Yeet is a powerful browser extension that enables seamless, bidirectional cross-posting between X (formerly Twitter) and Threads. Built by [Shivam Taneja](https://github.com/shivam-taneja).

Website: [yeet.shivamtaneja.com](https://yeet.shivamtaneja.com/)
Website Source Code: [shivam-taneja/yeet-web](https://github.com/shivam-taneja/yeet-web)
Install: [Chrome Web Store](https://chromewebstore.google.com/detail/knbfidiiikhjebpijhafdikkjhbgbefe)

## Demo

https://github.com/user-attachments/assets/1b7b4be9-996c-411b-a182-0f14d98a52e6

## Features

- Bidirectional **text** cross-posting (X ↔ Threads).
- Works from popup composers, feed posts, and inline reply bars (Post click + Cmd/Ctrl + Enter).
- Respects destination character limits (Threads 500; X 280 free / 25,000 Premium via sidebar detection).
- Per-direction composer rules in Settings (new posts always on; mention / quote / reply toggles; thread continuation coming soon).
- Real-time progress indicators when yeeting, plus a clickable last-yeet link in the popup.
- Global pause/resume toggle and **Reset everything to default** in Settings.
- Media copy toggles are visible but locked until image support ships.

## TODO / Roadmap

Check out the [TODO.md](./TODO.md) file for the full list of planned features, including media support and resilient retries.

## How it works (text)

1. **Capture** on the source platform when you Post (or Cmd/Ctrl + Enter).
2. **Stash** plain text in extension storage (nothing goes in the intent URL).
3. Open a **background intent tab** on the destination (`?yeet_auto_post=true`).
4. **MAIN-world inject** — Lexical `setEditorState` on Threads, Draft.js on X.
5. Click Post, watch the create-post API for permalink/id, then close the tab.

| Direction   | Capture           | Inject                   | Success watch                  |
| ----------- | ----------------- | ------------------------ | ------------------------------ |
| X → Threads | Draft.js composer | Lexical (`threads-main`) | Threads configure*text*\* APIs |
| Threads → X | Lexical composer  | Draft.js (`x-main`)      | X `CreateTweet`                |

## Project Structure

```text
.
├── assets/                  # Static assets like fonts, icons, and tailwind.css
├── components/              # React components (Popup UI, Options, Shared UI)
├── entrypoints/             # WXT Entrypoints
│   ├── background.ts        # Background service worker (tabs + OTA selectors)
│   ├── options/             # Options page
│   ├── popup/               # Popup page
│   ├── threads.content.ts   # Threads isolated (capture + run X→Threads auto-post)
│   ├── threads-main.content.ts  # Threads MAIN (Lexical inject + fetch patch)
│   ├── x.content.ts         # X isolated (capture + run Threads→X auto-post)
│   └── x-main.content.ts    # X MAIN (Draft inject + CreateTweet watch)
├── hooks/                   # Shared React hooks (e.g. use-settings.ts)
├── lib/                     # Core business logic
│   ├── character-limits.ts  # Shared destination character limits
│   ├── settings-defaults.ts # Default settings + reset source of truth
│   ├── cross-post/          # Pending text, page messages, MAIN inject bridge
│   ├── threads-to-x/        # Threads → X flow
│   ├── x-to-threads/        # X → Threads flow
│   ├── threads/             # Threads handlers, contexts, post-button detection
│   ├── x/                   # X handlers, contexts, Premium cache
│   ├── constants.ts         # Fallback selectors + merge helper
│   ├── dom-utils.ts         # Draft.js / Lexical text extraction
│   └── selectors.json       # OTA UI selectors + feature flags
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

When updating logic related to X or Threads DOM elements, **do not** hardcode them in the content scripts.
Instead, Yeet uses an **Over-The-Air (OTA) update system** for UI selectors. If a platform changes its UI (e.g., modifying a button's class name):

1. Update `lib/selectors.json` with the new DOM selector (or feature flags).
2. Keep `public/selectors.json` in sync if older builds still fetch it.
3. Push to the `main` branch. (`lib/constants.ts` imports the lib JSON directly, so there's no need to update fallbacks manually).

The extension automatically fetches the latest JSON payload from the raw GitHub URL in the background, fixing broken selectors for all users instantly without requiring a Web Store update!

Feature flags in `selectors.json`:

- `features.xToThreads` — gate X → Threads
- `features.threadsToX` — gate Threads → X

## License

MIT. See [LICENSE](LICENSE).
