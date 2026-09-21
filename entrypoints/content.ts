export default defineContentScript({
  matches: ["*://*.x.com/*", "*://*.twitter.com/*", "*://*.threads.net/*"],
  main() {
    console.log(
      "[Yeet] extension woke up. nobody asked. both apps will suffer.",
    );
  },
});
