export default defineContentScript({
  matches: ["*://*.x.com/*", "*://*.twitter.com/*", "*://*.threads.com/*"],
  main() {
    console.log("[Yeet] Content script active.");
  },
});
