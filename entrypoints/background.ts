export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "openBackgroundTab") {
      browser.tabs.create({ url: message.url, active: false });
    }

    if (message.action === "closeTab") {
      if (sender.tab && sender.tab.id) {
        browser.tabs.remove(sender.tab.id);
      }
    }
  });
});
