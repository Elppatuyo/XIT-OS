const desktopApps = document.getElementById("desktopApps");
const startButton = document.getElementById("startButton");
const startMenu = document.getElementById("startMenu");
const addAppButton = document.getElementById("addAppButton");
const settingsButton = document.getElementById("settingsButton");
const addAppModal = document.getElementById("addAppModal");
const cancelButton = document.getElementById("cancelButton");
const saveButton = document.getElementById("saveButton");
const appName = document.getElementById("appName");
const appURL = document.getElementById("appURL");
const clock = document.getElementById("clock");

let apps = JSON.parse(localStorage.getItem("webos_apps") || "[]");
let zIndex = 20;

function saveApps() {
  localStorage.setItem("webos_apps", JSON.stringify(apps));
}

function renderApps() {
  if (!desktopApps) return;
  desktopApps.innerHTML = "";

  apps.forEach((app) => {
    const icon = document.createElement("div");
    icon.className = "desktopApp";
    icon.innerHTML = `
      <div class="appIcon">🌐</div>
      <div class="appName">${escapeHTML(app.name)}</div>
    `;

    icon.addEventListener("click", () => openApp(app));
    desktopApps.appendChild(icon);
  });
}

function openApp(app) {
  const win = document.createElement("div");
  win.className = "os-window";
  win.style.zIndex = String(++zIndex);
  win.style.left = "10%";
  win.style.top = "10%";

  win.innerHTML = `
    <div class="window-titlebar">
      <span>${escapeHTML(app.name)}</span>
      <div class="window-buttons">
        <button class="minimize">−</button>
        <button class="maximize">□</button>
        <button class="close">×</button>
      </div>
    </div>

    <div class="window-toolbar">
      <button class="back">←</button>
      <input class="address" value="${escapeAttr(app.url)}">
      <button class="go">Ir</button>
    </div>

    <div class="window-content">
      <iframe class="frame" sandbox="allow-forms allow-modals allow-popups allow-scripts allow-same-origin"></iframe>
    </div>
  `;

  document.body.appendChild(win);

  const frame = win.querySelector(".frame");
  const address = win.querySelector(".address");
  const closeBtn = win.querySelector(".close");
  const minimizeBtn = win.querySelector(".minimize");
  const maximizeBtn = win.querySelector(".maximize");
  const goBtn = win.querySelector(".go");

  function loadUrl(url) {
    try {
      const u = new URL(url);
      if (!["http:", "https:"].includes(u.protocol)) throw new Error();
      frame.src = "/api/proxy?url=" + encodeURIComponent(u.href);
      address.value = u.href;
    } catch {
      alert("URL inválida");
    }
  }

  closeBtn.onclick = () => win.remove();
  minimizeBtn.onclick = () => win.classList.toggle("minimized");
  maximizeBtn.onclick = () => win.classList.toggle("maximized");
  goBtn.onclick = () => loadUrl(address.value.trim());

  win.querySelector(".back").onclick = () => {
    try {
      frame.contentWindow.history.back();
    } catch {}
  };

  win.addEventListener("mousedown", () => {
    win.style.zIndex = String(++zIndex);
  });

  makeDraggable(win);
  loadUrl(app.url);
}

function makeDraggable(win) {
  const bar = win.querySelector(".window-titlebar");
  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  bar.addEventListener("pointerdown", (e) => {
    if (win.classList.contains("maximized")) return;
    dragging = true;
    const r = win.getBoundingClientRect();
    offsetX = e.clientX - r.left;
    offsetY = e.clientY - r.top;
    bar.setPointerCapture(e.pointerId);
  });

  bar.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    win.style.left = `${e.clientX - offsetX}px`;
    win.style.top = `${e.clientY - offsetY}px`;
  });

  bar.addEventListener("pointerup", () => {
    dragging = false;
  });
}

function showAddModal() {
  if (addAppModal) addAppModal.classList.remove("hidden");
}

function hideAddModal() {
  if (addAppModal) addAppModal.classList.add("hidden");
}

if (startButton && startMenu) {
  startButton.onclick = () => startMenu.classList.toggle("show");
}

if (addAppButton) {
  addAppButton.onclick = () => {
    if (startMenu) startMenu.classList.remove("show");
    showAddModal();
  };
}

if (settingsButton) {
  settingsButton.onclick = () => {
    alert("Configuración todavía no está lista.");
  };
}

if (cancelButton) {
  cancelButton.onclick = hideAddModal;
}

if (saveButton) {
  saveButton.onclick = () => {
    const name = appName?.value.trim();
    let url = appURL?.value.trim();

    if (!name || !url) {
      alert("Escribe un nombre y una URL");
      return;
    }

    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error();
      apps.push({ name, url: parsed.href });
      saveApps();
      renderApps();
      appName.value = "";
      appURL.value = "";
      hideAddModal();
    } catch {
      alert("URL inválida");
    }
  };
}

function updateClock() {
  if (!clock) return;
  clock.textContent = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function escapeHTML(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(text) {
  return String(text).replaceAll('"', "&quot;");
}

setInterval(updateClock, 1000);
updateClock();
renderApps();
