export default defineContentScript({
  matches: ["*://*.x.com/*", "*://*.twitter.com/*", "*://*.threads.com/*"],
  main() {
    console.log(
      "[Yeet] extension woke up. nobody asked. both apps will suffer.",
    );
  },
});
