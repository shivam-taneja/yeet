# Yeet

Yeet is a powerful browser extension that enables seamless, bidirectional cross-posting between X (formerly Twitter) and Threads. Built by [Shivam Taneja](https://github.com/shivam-taneja).

Website: [yeet.shivamtaneja.com](https://yeet.shivamtaneja.com/)
Website Source Code: [shivam-taneja/yeet-web](https://github.com/shivam-taneja/yeet-web)

## Demo

https://github.com/user-attachments/assets/1b7b4be9-996c-411b-a182-0f14d98a52e6

## Features

- Cross-post from X to Threads automatically.
- Cross-post from Threads to X automatically.
- Supports standard mouse clicks and Cmd/Ctrl + Enter shortcuts.
- Gracefully handles character limits (e.g., 280 for X, 500 for Threads).
- Settings toggle to easily turn the extension on and off.
- Fully typed with TypeScript and built on top of the robust WXT framework.

## TODO / Roadmap

Check out the [TODO.md](./TODO.md) file for the full list of planned features, including media support and resilient retries.

## X Post Contexts

Yeet uses X's `tweetTextarea_0_label` element to detect what type of post is being composed, and gates cross-posting accordingly. Each context maps to a toggle in Settings.

| Label text            | Context       | Default        | Notes                                                                                    |
| --------------------- | ------------- | -------------- | ---------------------------------------------------------------------------------------- |
| `"What's happening?"` | `newPost`     | ✅ Always on   | Standard new post — can't be disabled                                                    |
| `"@username"`         | `mentionPost` | ❌ Off         | Composing from someone's profile; their @handle may not match on Threads                 |
| `"Add a comment"`     | `quote`       | ❌ Off         | Quote tweet — cross-posts comment text only (quoted tweet URL not accessible in X's DOM) |
| `"Post your reply"`   | `reply`       | ❌ Off         | Replies lack context on Threads, off by default                                          |
| `"Add another post"`  | `thread`      | 🔒 Coming soon | Thread continuation — needs logic to find and append to existing Threads post            |

Any label not in this list is treated as `unknown` and blocked by default.

## Project Structure

```text
.
├── assets/                  # Static assets like fonts, icons, and tailwind.css
├── components/              # React components (Popup UI, Shared Components, UI Elements)
├── entrypoints/             # WXT Entrypoints
│   ├── background.ts        # Background service worker handling tab management
│   ├── options/             # Options page source files
│   ├── popup/               # Popup page source files
│   ├── threads.content.ts   # Content script specifically for intercepting Threads
│   └── x.content.ts         # Content script specifically for intercepting X
├── hooks/                   # Shared React hooks (e.g., use-settings.ts)
├── lib/                     # Core business logic and shared utilities
│   ├── constants.ts         # Centralized DOM selectors for X and Threads
│   └── dom-utils.ts         # Utility functions for DOM text extraction
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

| Variable        | Values           | Description                                                                                                                                                       |
| --------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_DEV_MODE` | `true` / `false` | When `true`, cross-posting is intercepted — posts are logged to the console instead of actually being sent. Set to `true` while developing to avoid double posts. |

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

## Contributing

Contributions are welcome! If you'd like to help improve Yeet, please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature or bugfix (`git checkout -b feature-name`).
3. Make your changes.
4. Ensure your code passes the build step (`pnpm build`).
5. Commit your changes (`git commit -m 'Add some feature'`).
6. Push to the branch (`git push origin feature-name`).
7. Open a Pull Request.

When updating logic related to X or Threads DOM elements, **do not** hardcode them in the content scripts.
Instead, Yeet uses an **Over-The-Air (OTA) update system** for UI selectors. If a platform changes its UI (e.g., modifying a button's class name):

1. Update `public/selectors.json` with the new DOM selector.
2. Update the fallback values in `lib/constants.ts`.
3. Push to the `main` branch.
   The extension automatically fetches the latest JSON payload from the raw GitHub URL in the background, fixing broken selectors for all users instantly without requiring a Web Store update!

## License

MIT. See [LICENSE](LICENSE).
