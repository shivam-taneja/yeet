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
  manifest: {
    permissions: [
      "activeTab",
      "storage",
      "unlimitedStorage",
      "cookies",
      "tabs",
      "windows",
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
      },
    },
  },
});
