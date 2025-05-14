document.addEventListener("DOMContentLoaded", async () => {
  const domainList = document.getElementById("domainList");

  const tabs = await chrome.tabs.query({ currentWindow: true });
  const domains = {};

  tabs.forEach((tab) => {
    if (tab.url.startsWith("http")) {
      const url = new URL(tab.url);
      domains[url.hostname] = true;
    }
  });

  const storage = await chrome.storage.local.get("enabledDomains");
  const enabledDomains = storage.enabledDomains || {};

  Object.keys(domains).forEach((domain) => {
    const row = document.createElement("div");
    row.className = "domain-row";

    const label = document.createElement("span");
    label.textContent = domain;

    const toggle = document.createElement("label");
    toggle.className = "switch";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.checked = !!enabledDomains[domain];

    input.addEventListener("change", () => {
      enabledDomains[domain] = input.checked;
      chrome.storage.local.set({ enabledDomains });
    });

    const slider = document.createElement("span");
    slider.className = "slider";

    toggle.appendChild(input);
    toggle.appendChild(slider);

    row.appendChild(label);      
    row.appendChild(toggle);     
    domainList.appendChild(row); 
  });
});
