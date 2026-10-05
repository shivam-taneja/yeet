import { installXMainWorld } from "@/lib/threads-to-x";

export default defineContentScript({
  matches: ["*://*.x.com/*", "*://x.com/*"],
  world: "MAIN",
  runAt: "document_start",
  main() {
    installXMainWorld();
  },
});
