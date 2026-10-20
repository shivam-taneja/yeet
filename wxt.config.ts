import { defineConfig } from "wxt";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
  vite: () => ({
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./"),
      },
    },
  }),
  autoIcons: {
    developmentIndicator: "overlay",
  },
  webExt: {
    disabled: true,
  },
  zip: {
    excludeSources: ["motion/**"],
  },
  manifest: ({ browser }) => ({
    permissions: [
      "activeTab",
      "storage",
      "unlimitedStorage",
      "cookies",
      "tabs",
      // Chrome/Edge only — Firefox rejects "windows" as an invalid permission.
      ...(browser === "firefox" ? [] : ["windows"]),
    ],
    host_permissions: [
      "*://*.x.com/*",
      "*://x.com/*",
      "*://*.threads.com/*",
      "*://threads.com/*",
      "*://*.instagram.com/*",
      "*://instagram.com/*",
    ],
    browser_specific_settings: {
      gecko: {
        id: "yeet@shivamtaneja.com",
        strict_min_version: "109.0",
        data_collection_permissions: {
          required: ["none"],
        },
      },
    },
  }),
});
