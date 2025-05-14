document.addEventListener("DOMContentLoaded", async () => {
  const domainList = document.getElementById("domainList");

  // Default : Inject all
  const defaultToggle = document.createElement("div");
  defaultToggle.innerHTML = `
    <label style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
      <span><strong>🚀 Inject All By Default</strong></span>
      <label class="switch">
        <input type="checkbox" id="defaultSwitch">
        <span class="slider"></span>
      </label>
    </label>
  `;
  domainList.before(defaultToggle);

  const defaultCheckbox = defaultToggle.querySelector("#defaultSwitch");

  // Load default flag
  chrome.storage.local.get("defaultInjectAll", (res) => {
    defaultCheckbox.checked = res.defaultInjectAll || false;
  });

  // Save flag on toggle
  defaultCheckbox.addEventListener("change", () => {
    chrome.storage.local.set({ defaultInjectAll: defaultCheckbox.checked });
  });

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
