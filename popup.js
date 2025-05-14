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

  // Lấy danh sách domain từ các tab hiện tại
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const domains = {};
  tabs.forEach((tab) => {
    if (tab.url.startsWith("http")) {
      const url = new URL(tab.url);
      domains[url.hostname] = true;
    }
  });

  // Tạo UI cho từng domain
  const domainToggles = {};
  Object.keys(domains).forEach((domain) => {
    const row = document.createElement("div");
    row.className = "domain-row";

    const label = document.createElement("span");
    label.textContent = domain;

    const toggle = document.createElement("label");
    toggle.className = "switch";

    const input = document.createElement("input");
    input.type = "checkbox";
    input.dataset.domain = domain;
    domainToggles[domain] = input;

    const slider = document.createElement("span");
    slider.className = "slider";

    toggle.appendChild(input);
    toggle.appendChild(slider);

    row.appendChild(label);
    row.appendChild(toggle);
    domainList.appendChild(row);
  });

  // Load trạng thái từ storage
  const storage = await chrome.storage.local.get(["enabledDomains", "defaultInjectAll"]);
  const enabledDomains = storage.enabledDomains || {};
  const defaultInjectAll = storage.defaultInjectAll || false;
  defaultCheckbox.checked = defaultInjectAll;

  // Cập nhật UI domain toggle theo trạng thái
  Object.keys(domainToggles).forEach((domain) => {
    if (defaultInjectAll) {
      domainToggles[domain].checked = true;
      domainToggles[domain].disabled = true;
    } else {
      domainToggles[domain].checked = !!enabledDomains[domain];
      domainToggles[domain].disabled = false;
    }
  });

  // Sự kiện toggle default
  defaultCheckbox.addEventListener("change", () => {
    if (defaultCheckbox.checked) {
      // Bật default: tất cả domain ON, disable toggle domain
      Object.keys(domainToggles).forEach((domain) => {
        domainToggles[domain].checked = true;
        domainToggles[domain].disabled = true;
      });
      chrome.storage.local.set({ defaultInjectAll: true, enabledDomains: {} });
    } else {
      // Tắt default: enable toggle domain, giữ trạng thái cũ
      Object.keys(domainToggles).forEach((domain) => {
        domainToggles[domain].disabled = false;
        // Giữ trạng thái checked theo enabledDomains
        domainToggles[domain].checked = !!enabledDomains[domain];
      });
      chrome.storage.local.set({ defaultInjectAll: false });
    }
  });

  // Sự kiện toggle từng domain
  Object.keys(domainToggles).forEach((domain) => {
    domainToggles[domain].addEventListener("change", () => {
      // Nếu đang bật default mà user tắt 1 domain => tắt default
      if (defaultCheckbox.checked && !domainToggles[domain].checked) {
        defaultCheckbox.checked = false;
        defaultCheckbox.dispatchEvent(new Event("change"));
      }

      // Kiểm tra nếu tất cả domain đều bật thì bật default
      const allChecked = Object.values(domainToggles).every(tg => tg.checked);
      if (allChecked && !defaultCheckbox.checked) {
        defaultCheckbox.checked = true;
        defaultCheckbox.dispatchEvent(new Event("change"));
        return; // Đã đồng bộ trạng thái, không cần lưu enabledDomains nữa
      }

      // Lưu trạng thái enabledDomains
      const newEnabledDomains = {};
      Object.keys(domainToggles).forEach((d) => {
        newEnabledDomains[d] = domainToggles[d].checked;
      });
      chrome.storage.local.set({ enabledDomains: newEnabledDomains });
    });
  });
});
