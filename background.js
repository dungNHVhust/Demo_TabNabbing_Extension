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

  const { enabledDomains } = await chrome.storage.local.get("enabledDomains");

  bgTabs.forEach((tab) => {
    const tabHostname = new URL(tab.url).hostname;
    const matchedDomain = Object.keys(enabledDomains || {}).find((d) =>
      tabHostname.endsWith(d)
    );

    if (matchedDomain && enabledDomains[matchedDomain]) {
      const timeoutId = setTimeout(() => {
        // chrome.scripting.executeScript({
        //   target: { tabId: tab.id },
        //   func: () => {
        //     const iframe = document.createElement("iframe");
        //     iframe.src = chrome.runtime.getURL("inject.html");
        //     iframe.style.position = "fixed";
        //     iframe.style.top = 0;
        //     iframe.style.left = 0;
        //     iframe.style.width = "100vw";
        //     iframe.style.height = "100vh";
        //     iframe.style.zIndex = 999999;
        //     document.body.appendChild(iframe);
        //   },
        // });

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
