import { installThreadsMainWorld } from "@/lib/x-to-threads";

export default defineContentScript({
  matches: ["*://*.threads.com/*", "*://*.threads.net/*"],
  world: "MAIN",
  runAt: "document_start",
  main() {
    installThreadsMainWorld();
  },
});
