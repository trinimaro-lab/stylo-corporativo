/* ==========================================================================
   Editor de reseñas — panel de administración (admin.html)
   Lee y guarda en /api/reviews (base de datos), visible para todos los
   visitantes del sitio apenas se guarda un cambio.

   Los campos (nombre, empresa, reseña, foto) se guardan en memoria mientras
   se editan, y se envían todos juntos al hacer clic en "Guardar cambios".
   Agregar y eliminar siguen siendo inmediatos.

   Cómo usarlo: en una página con:
     <div id="reviews-editor-root"></div>
     <script src="editor-ui.js"></script>
     <script src="reviews-editor.js"></script>
   este script arma ahí la lista editable.
   ========================================================================== */

(function () {
  "use strict";

  const UI = window.StyloEditorUI;

  const root = document.getElementById("reviews-editor-root");
  if (!root) return;

  let reviews = [];
  let dirtyIds = new Set();

  async function api(method, body) {
    const res = await UI.authFetch("/api/reviews", {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
      const err = new Error("request failed: " + res.status);
      err.isAuthError = res.status === 401;
      throw err;
    }
    return res.json();
  }

  // authFetch ya avisa "clave incorrecta o vencida" y vuelve a pedirla;
  // no lo tapemos con un segundo toast genérico.
  function notifyFailure(message, err) {
    if (err && err.isAuthError) return;
    UI.showToast(message);
  }

  async function loadReviews() {
    const res = await fetch("/api/reviews");
    reviews = res.ok ? await res.json() : [];
    render();
  }

  function uid() {
    return "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function initials(name) {
    return (name || "?").trim().charAt(0).toUpperCase();
  }

  function updateSaveBtnState() {
    const saveBtn = document.getElementById("reviews-save-btn");
    if (saveBtn) saveBtn.disabled = dirtyIds.size === 0;
  }

  function render() {
    root.innerHTML = "";

    const list = document.createElement("div");
    list.className = "reviews-editor-list";
    reviews.forEach(review => list.appendChild(buildRow(review)));
    root.appendChild(list);

    const actions = document.createElement("div");
    actions.className = "catalog-toolbar";

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "catalog-add-btn";
    addBtn.textContent = "+ Agregar reseña";
    addBtn.addEventListener("click", async () => {
      const review = { id: uid(), name: "Nombre del cliente", company: "", review: "Escribe aquí la reseña.", photo: "" };
      try {
        await api("POST", review);
        reviews.push(review);
        render();
        UI.showToast("Reseña agregada.");
      } catch (e) {
        notifyFailure("No se pudo agregar la reseña.", e);
      }
    });

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.id = "reviews-save-btn";
    saveBtn.className = "catalog-edit-bar__save";
    saveBtn.textContent = "Guardar cambios";
    saveBtn.disabled = dirtyIds.size === 0;
    saveBtn.addEventListener("click", saveChanges);

    actions.appendChild(addBtn);
    actions.appendChild(saveBtn);
    root.appendChild(actions);
  }

  async function saveChanges() {
    if (dirtyIds.size === 0) return;
    const pending = reviews.filter(r => dirtyIds.has(r.id));
    try {
      for (const review of pending) {
        await api("POST", review);
        dirtyIds.delete(review.id);
      }
      updateSaveBtnState();
      UI.showToast("Cambios guardados.");
    } catch (e) {
      updateSaveBtnState();
      notifyFailure("No se pudieron guardar todos los cambios. Vuelve a intentar.", e);
    }
  }

  function buildRow(review) {
    const row = document.createElement("div");
    row.className = "reviews-editor-row";

    const photoWrap = document.createElement("label");
    photoWrap.className = "reviews-editor-row__photo";
    if (review.photo) {
      const img = document.createElement("img");
      img.src = review.photo;
      img.alt = review.name;
      photoWrap.appendChild(img);
    } else {
      photoWrap.textContent = initials(review.name);
    }
    const photoBtn = document.createElement("span");
    photoBtn.className = "reviews-editor-row__photo-btn";
    photoBtn.textContent = "Cambiar";
    photoWrap.appendChild(photoBtn);

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.className = "visually-hidden";
    fileInput.addEventListener("change", ev => {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        review.photo = reader.result;
        dirtyIds.add(review.id);
        render();
      };
      reader.readAsDataURL(file);
    });
    photoWrap.appendChild(fileInput);

    const fields = document.createElement("div");
    fields.className = "reviews-editor-row__fields";

    const top = document.createElement("div");
    top.className = "reviews-editor-row__fields-top";

    function markDirty() {
      dirtyIds.add(review.id);
      updateSaveBtnState();
    }

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Nombre";
    nameInput.value = review.name;
    nameInput.addEventListener("input", () => { review.name = nameInput.value; markDirty(); });
    nameInput.addEventListener("blur", () => { render(); });

    const companyInput = document.createElement("input");
    companyInput.type = "text";
    companyInput.placeholder = "Empresa";
    companyInput.value = review.company;
    companyInput.addEventListener("input", () => { review.company = companyInput.value; markDirty(); });

    top.appendChild(nameInput);
    top.appendChild(companyInput);

    const reviewInput = document.createElement("textarea");
    reviewInput.rows = 3;
    reviewInput.placeholder = "Reseña";
    reviewInput.value = review.review;
    reviewInput.addEventListener("input", () => { review.review = reviewInput.value; markDirty(); });

    fields.appendChild(top);
    fields.appendChild(reviewInput);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "reviews-editor-row__delete";
    deleteBtn.textContent = "Eliminar";
    deleteBtn.addEventListener("click", () => {
      UI.askConfirm(`¿Eliminar la reseña de "${review.name}"?`, async () => {
        try {
          await api("DELETE", { id: review.id });
          reviews = reviews.filter(r => r.id !== review.id);
          dirtyIds.delete(review.id);
          render();
          UI.showToast("Reseña eliminada.");
        } catch (e) {
          notifyFailure("No se pudo eliminar.", e);
        }
      });
    });

    row.appendChild(photoWrap);
    row.appendChild(fields);
    row.appendChild(deleteBtn);
    return row;
  }

  loadReviews();
})();
