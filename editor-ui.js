/* ==========================================================================
   Utilidades compartidas por los editores del sitio (catálogo y reseñas).
   Expone window.StyloEditorUI con un modal de clave, un confirm y un toast,
   todos con la misma identidad visual del sitio (sin diálogos nativos del
   navegador, que algunos navegadores bloquean).

   La clave que se ingresa se guarda como "token" y se envía en el header
   x-admin-token a las funciones de Netlify (/api/products, /api/reviews),
   que la validan contra la variable de entorno ADMIN_TOKEN. La clave NUNCA
   se guarda en el código: si es incorrecta, la API responde 401 y se vuelve
   a pedir.
   ========================================================================== */

window.StyloEditorUI = (function () {
  "use strict";

  var TOKEN_KEY = "stylo_admin_token";

  var overlayRoot = document.createElement("div");
  overlayRoot.className = "editor-modal-root";
  document.body.appendChild(overlayRoot);

  function closeModal() {
    overlayRoot.innerHTML = "";
    overlayRoot.classList.remove("is-open");
  }

  function getToken() {
    return sessionStorage.getItem(TOKEN_KEY) || "";
  }

  function setToken(value) {
    sessionStorage.setItem(TOKEN_KEY, value);
  }

  function clearToken() {
    sessionStorage.removeItem(TOKEN_KEY);
  }

  function isUnlocked() {
    return !!getToken();
  }

  function askPassword(title, description, onSuccess) {
    overlayRoot.innerHTML =
      '<div class="editor-modal">' +
        "<h3>" + title + "</h3>" +
        "<p>" + description + "</p>" +
        '<input type="password" class="editor-modal__input" id="editor-pass-input" placeholder="Clave" autocomplete="off">' +
        '<p class="editor-modal__error" id="editor-pass-error" hidden>Clave incorrecta.</p>' +
        '<div class="editor-modal__actions">' +
          '<button type="button" class="editor-modal__btn editor-modal__btn--ghost" data-action="cancel">Cancelar</button>' +
          '<button type="button" class="editor-modal__btn editor-modal__btn--primary" data-action="ok">Entrar</button>' +
        "</div>" +
      "</div>";
    overlayRoot.classList.add("is-open");

    var input = document.getElementById("editor-pass-input");
    input.focus();

    function attempt() {
      if (!input.value) return;
      setToken(input.value);
      closeModal();
      onSuccess();
    }

    overlayRoot.addEventListener("click", function handler(ev) {
      if (ev.target === overlayRoot) { closeModal(); overlayRoot.removeEventListener("click", handler); }
    });
    overlayRoot.querySelector('[data-action="cancel"]').addEventListener("click", closeModal);
    overlayRoot.querySelector('[data-action="ok"]').addEventListener("click", attempt);
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") { ev.preventDefault(); attempt(); }
      if (ev.key === "Escape") { closeModal(); }
    });
  }

  function showPasswordError() {
    var error = document.getElementById("editor-pass-error");
    if (error) error.hidden = false;
  }

  function askConfirm(message, onConfirm) {
    overlayRoot.innerHTML =
      '<div class="editor-modal">' +
        "<h3>Confirmar</h3>" +
        "<p>" + message + "</p>" +
        '<div class="editor-modal__actions">' +
          '<button type="button" class="editor-modal__btn editor-modal__btn--ghost" data-action="cancel">Cancelar</button>' +
          '<button type="button" class="editor-modal__btn editor-modal__btn--danger" data-action="ok">Confirmar</button>' +
        "</div>" +
      "</div>";
    overlayRoot.classList.add("is-open");
    overlayRoot.querySelector('[data-action="cancel"]').addEventListener("click", closeModal);
    overlayRoot.querySelector('[data-action="ok"]').addEventListener("click", function () {
      closeModal();
      onConfirm();
    });
  }

  var toastTimer = null;
  function showToast(message) {
    var toast = document.getElementById("editor-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "editor-toast";
      toast.className = "editor-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove("is-visible"); }, 2200);
  }

  var lastPrompt = { title: "Panel de administración", description: "Ingresa la clave para continuar editando." };

  function unlockAndRun(editorTitle, editorDescription, run) {
    lastPrompt = { title: editorTitle, description: editorDescription };
    if (isUnlocked()) { run(); return; }
    askPassword(editorTitle, editorDescription, run);
  }

  // fetch con el header de autorización; si la API dice que la clave está
  // mal o venció (401), la borra, avisa y vuelve a pedirla en el momento
  // (en vez de fallar en silencio con un error genérico).
  async function authFetch(url, options) {
    options = options || {};
    var headers = Object.assign({}, options.headers || {}, { "x-admin-token": getToken() });
    var res = await fetch(url, Object.assign({}, options, { headers: headers }));
    if (res.status === 401) {
      clearToken();
      showToast("Clave incorrecta o vencida. Vuelve a ingresarla.");
      askPassword(lastPrompt.title, lastPrompt.description, function () {
        showToast("Clave actualizada. Vuelve a intentar tu cambio.");
      });
    }
    return res;
  }

  return {
    askConfirm: askConfirm,
    showToast: showToast,
    showPasswordError: showPasswordError,
    isUnlocked: isUnlocked,
    unlockAndRun: unlockAndRun,
    getToken: getToken,
    clearToken: clearToken,
    authFetch: authFetch
  };
})();
