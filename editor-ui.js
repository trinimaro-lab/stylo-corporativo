/* ==========================================================================
   Utilidades compartidas por los editores del sitio (catálogo y reseñas).
   Expone window.StyloEditorUI con un modal de clave, un confirm y un toast,
   todos con la misma identidad visual del sitio (sin diálogos nativos del
   navegador, que algunos navegadores bloquean).
   ========================================================================== */

window.StyloEditorUI = (function () {
  "use strict";

  var EDIT_PASSWORD = "stylo2026"; // cámbiala por la clave que prefieras
  var SESSION_FLAG = "stylo_edit_unlocked";

  var overlayRoot = document.createElement("div");
  overlayRoot.className = "editor-modal-root";
  document.body.appendChild(overlayRoot);

  function closeModal() {
    overlayRoot.innerHTML = "";
    overlayRoot.classList.remove("is-open");
  }

  function isUnlocked() {
    return sessionStorage.getItem(SESSION_FLAG) === "1";
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
    var error = document.getElementById("editor-pass-error");
    input.focus();

    function attempt() {
      if (input.value === EDIT_PASSWORD) {
        sessionStorage.setItem(SESSION_FLAG, "1");
        closeModal();
        onSuccess();
      } else {
        error.hidden = false;
        input.select();
      }
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

  function unlockAndRun(editorTitle, editorDescription, run) {
    if (isUnlocked()) { run(); return; }
    askPassword(editorTitle, editorDescription, run);
  }

  return {
    askConfirm: askConfirm,
    showToast: showToast,
    isUnlocked: isUnlocked,
    unlockAndRun: unlockAndRun
  };
})();
