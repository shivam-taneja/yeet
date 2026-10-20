import { installThreadsMainWorld } from "@/lib/x-to-threads";

export default defineContentScript({
  matches: [
    "*://*.threads.com/*",
    "*://threads.com/*",
    "*://*.threads.net/*",
    "*://threads.net/*",
  ],
  world: "MAIN",
  runAt: "document_start",
  main() {
    installThreadsMainWorld();
  },
});
