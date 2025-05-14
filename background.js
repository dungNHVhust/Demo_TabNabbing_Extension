const trackedTabs = {};

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  for (const id in trackedTabs) {
    clearTimeout(trackedTabs[id]);
    delete trackedTabs[id];
  }

  const allTabs = await chrome.tabs.query({ currentWindow: true });
  const bgTabs = allTabs.filter(
    (tab) => tab.id !== tabId && tab.active === false
  );

  const { enabledDomains, defaultInjectAll } = await chrome.storage.local.get([
    "enabledDomains",
    "defaultInjectAll",
  ]);

  bgTabs.forEach((tab) => {
    if (!tab.url) return;

    const tabHostname = new URL(tab.url).hostname;
    // Nếu defaultInjectAll đang bật, inject tất cả domain
    if (defaultInjectAll) {
      const timeoutId = setTimeout(() => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            window.location.href = chrome.runtime.getURL("inject.html");
          },
        });
        delete trackedTabs[tab.id];
      }, 3 * 1000);
      trackedTabs[tab.id] = timeoutId;
      return;
    }
    // Nếu defaultInjectAll tắt, chỉ inject các domain được bật riêng lẻ
    if (enabledDomains && enabledDomains[tabHostname]) {
      const timeoutId = setTimeout(() => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            window.location.href = chrome.runtime.getURL("inject.html");
          },
        });
        delete trackedTabs[tab.id];
      }, 3 * 1000);
      trackedTabs[tab.id] = timeoutId;
    }
  });
});
