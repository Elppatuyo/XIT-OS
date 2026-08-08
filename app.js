const apps = [];

const appList = document.createElement("div");
appList.id = "app-list";
document.body.appendChild(appList);

function addApp() {
  const nameInput = document.querySelector(
    'input[placeholder="Nombre"]'
  );

  const urlInput = document.querySelector(
    'input[placeholder="https://ejemplo.com"]'
  );

  const name = nameInput?.value.trim();
  const url = urlInput?.value.trim();

  if (!name || !url) {
    alert("Escribe un nombre y una URL");
    return;
  }

  let validUrl;

  try {
    validUrl = new URL(url);

    if (!["http:", "https:"].includes(validUrl.protocol)) {
      throw new Error();
    }
  } catch {
    alert("Introduce una URL válida");
    return;
  }

  const app = {
    id: Date.now(),
    name,
    url: validUrl.href
  };

  apps.push(app);

  renderApp(app);

  nameInput.value = "";
  urlInput.value = "";
}

function renderApp(app) {
  const icon = document.createElement("button");

  icon.className = "app-icon";
  icon.innerHTML = `
    <span class="app-icon-image">🌐</span>
    <span>${escapeHtml(app.name)}</span>
  `;

  icon.onclick = () => openApp(app);

  appList.appendChild(icon);
}

function openApp(app) {
  const windowElement = document.createElement("div");

  windowElement.className = "os-window";

  windowElement.innerHTML = `
    <div class="window-titlebar">
      <span>${escapeHtml(app.name)}</span>

      <div class="window-buttons">
        <button class="minimize">−</button>
        <button class="maximize">□</button>
        <button class="close">×</button>
      </div>
    </div>

    <div class="window-toolbar">
      <button class="back">←</button>

      <input
        class="address"
        value="${escapeHtml(app.url)}"
      />

      <button class="go">Ir</button>
    </div>

    <div class="window-content">
      <iframe
        title="${escapeHtml(app.name)}"
        src="${escapeHtml(app.url)}"
      ></iframe>
    </div>
  `;

  document.body.appendChild(windowElement);

  makeDraggable(windowElement);

  const closeButton =
    windowElement.querySelector(".close");

  closeButton.onclick = () => {
    windowElement.remove();
  };

  const minimizeButton =
    windowElement.querySelector(".minimize");

  minimizeButton.onclick = () => {
    windowElement.classList.toggle("minimized");
  };

  const maximizeButton =
    windowElement.querySelector(".maximize");

  maximizeButton.onclick = () => {
    windowElement.classList.toggle("maximized");
  };

  const goButton =
    windowElement.querySelector(".go");

  const address =
    windowElement.querySelector(".address");

  const frame =
    windowElement.querySelector("iframe");

  goButton.onclick = () => {
    try {
      const newUrl = new URL(address.value);

      if (!["http:", "https:"].includes(newUrl.protocol)) {
        throw new Error();
      }

      frame.src = newUrl.href;
    } catch {
      alert("URL inválida");
    }
  };
}

function makeDraggable(element) {
  const titlebar =
    element.querySelector(".window-titlebar");

  let dragging = false;
  let offsetX = 0;
  let offsetY = 0;

  titlebar.addEventListener("pointerdown", event => {
    if (element.classList.contains("maximized")) {
      return;
    }

    dragging = true;

    const rect = element.getBoundingClientRect();

    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;

    titlebar.setPointerCapture(event.pointerId);
  });

  titlebar.addEventListener("pointermove", event => {
    if (!dragging) return;

    element.style.left =
      `${event.clientX - offsetX}px`;

    element.style.top =
      `${event.clientY - offsetY}px`;
  });

  titlebar.addEventListener("pointerup", () => {
    dragging = false;
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
