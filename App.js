const desktopApps =
  document.getElementById("desktopApps");

const taskbarApps =
  document.getElementById("taskbarApps");

const startButton =
  document.getElementById("startButton");

const startMenu =
  document.getElementById("startMenu");

const addAppButton =
  document.getElementById("addAppButton");

const addAppModal =
  document.getElementById("addAppModal");

const cancelButton =
  document.getElementById("cancelButton");

const saveButton =
  document.getElementById("saveButton");

const appName =
  document.getElementById("appName");

const appURL =
  document.getElementById("appURL");

const clock =
  document.getElementById("clock");


let apps = JSON.parse(
  localStorage.getItem("webos_apps") || "[]"
);


/* Guardar aplicaciones */

function saveApps() {

  localStorage.setItem(
    "webos_apps",
    JSON.stringify(apps)
  );

}


/* Mostrar aplicaciones */

function renderApps() {

  desktopApps.innerHTML = "";

  apps.forEach((app, index) => {

    const element =
      document.createElement("div");

    element.className =
      "desktopApp";

    element.innerHTML = `
      <div class="appIcon">
        🌐
      </div>

      <div class="appName">
        ${escapeHTML(app.name)}
      </div>
    `;

    element.onclick = () => {

      openApp(app, index);

    };

    desktopApps.appendChild(element);

  });

}


/* Abrir aplicación */

function openApp(app, index) {

  const proxyURL =
    "/api/proxy?url=" +
    encodeURIComponent(app.url);

  window.location.href = proxyURL;

}


/* Agregar aplicación */

addAppButton.onclick = () => {

  startMenu.classList.remove(
    "visible"
  );

  addAppModal.classList.remove(
    "hidden"
  );

  appName.focus();

};


/* Cancelar */

cancelButton.onclick = () => {

  addAppModal.classList.add(
    "hidden"
  );

};


/* Guardar */

saveButton.onclick = () => {

  const name =
    appName.value.trim();

  let url =
    appURL.value.trim();

  if (!name || !url) {

    alert(
      "Escribe el nombre y la URL."
    );

    return;

  }

  if (
    !/^https?:\/\//i.test(url)
  ) {

    url =
      "https://" + url;

  }

  try {

    new URL(url);

  } catch {

    alert(
      "La URL no es válida."
    );

    return;

  }

  apps.push({

    name: name,

    url: url

  });

  saveApps();

  renderApps();

  appName.value = "";

  appURL.value = "";

  addAppModal.classList.add(
    "hidden"
  );

};


/* Menú Inicio */

startButton.onclick = () => {

  startMenu.classList.toggle(
    "visible"
  );

};


/* Reloj */

function updateClock() {

  const now =
    new Date();

  clock.textContent =
    now.toLocaleTimeString(
      [],
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );

}

setInterval(
  updateClock,
  1000
);

updateClock();


/* Seguridad HTML */

function escapeHTML(text) {

  return text.replace(
    /[&<>"']/g,
    character => ({

      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"

    }[character])
  );

}


renderApps();
