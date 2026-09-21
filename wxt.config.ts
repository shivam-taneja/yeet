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
  manifest: {
    permissions: ["activeTab", "storage", "cookies"],
    host_permissions: [
      "*://*.x.com/*",
      "*://*.twitter.com/*",
      "*://*.threads.net/*",
    ],
  },
});
