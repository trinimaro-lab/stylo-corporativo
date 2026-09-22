/* ==========================================================================
   Editor de reseñas — panel de administración (admin.html)
   Lee y guarda en /api/reviews (base de datos). Incluye las reseñas que
   llegan solas desde la encuesta pública (encuesta.html) con estado
   "pending": no se ven en el sitio público hasta que se aprueban aquí.

   Los campos (nombre, empresa, calificación, reseña, foto) se guardan en
   memoria mientras se editan, y se envían todos juntos al hacer clic en
   "Guardar cambios". Agregar, eliminar y aprobar siguen siendo inmediatos.

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
  let filter = "all";

  async function api(method, url, body) {
    const res = await UI.authFetch(url, {
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
    const res = await UI.authFetch("/api/reviews");
    reviews = res.ok ? await res.json() : [];
    render();
  }

  function uid() {
    return "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function initials(name) {
    return (name || "?").trim().charAt(0).toUpperCase();
  }

  function formatDate(value) {
    if (!value) return "";
    try {
      return new Date(value).toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
    } catch (e) {
      return "";
    }
  }

  function starsText(rating) {
    const n = Math.min(5, Math.max(1, Number(rating) || 5));
    return "★".repeat(n) + "☆".repeat(5 - n);
  }

  function updateSaveBtnState() {
    const saveBtn = document.getElementById("reviews-save-btn");
    if (saveBtn) saveBtn.disabled = dirtyIds.size === 0;
  }

  function markDirty(id) {
    dirtyIds.add(id);
    updateSaveBtnState();
  }

  function visibleReviews() {
    if (filter === "pending") return reviews.filter(r => r.status === "pending");
    if (filter === "approved") return reviews.filter(r => r.status !== "pending");
    return reviews;
  }

  function buildFilterBar() {
    const bar = document.createElement("div");
    bar.className = "reviews-filter";

    const pendingCount = reviews.filter(r => r.status === "pending").length;
    const approvedCount = reviews.filter(r => r.status !== "pending").length;

    const options = [
      { value: "all", label: "Todas (" + reviews.length + ")" },
      { value: "pending", label: "Pendientes (" + pendingCount + ")" },
      { value: "approved", label: "Publicadas (" + approvedCount + ")" }
    ];

    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "reviews-filter__btn" + (filter === opt.value ? " is-active" : "");
      btn.textContent = opt.label;
      btn.addEventListener("click", () => { filter = opt.value; render(); });
      bar.appendChild(btn);
    });

    return bar;
  }

  function render() {
    root.innerHTML = "";

    root.appendChild(buildFilterBar());

    const list = document.createElement("div");
    list.className = "reviews-editor-list";
    visibleReviews().forEach(review => list.appendChild(buildRow(review)));
    if (visibleReviews().length === 0) {
      const empty = document.createElement("p");
      empty.className = "admin-hint";
      empty.style.margin = "8px 0 0";
      empty.textContent = "No hay reseñas en este filtro.";
      list.appendChild(empty);
    }
    root.appendChild(list);

    const actions = document.createElement("div");
    actions.className = "catalog-toolbar";

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "catalog-add-btn";
    addBtn.textContent = "+ Agregar reseña";
    addBtn.addEventListener("click", async () => {
      const review = { id: uid(), name: "Nombre del cliente", company: "", review: "Escribe aquí la reseña.", photo: "", product_photo: "", rating: 5, status: "approved" };
      try {
        await api("POST", "/api/reviews", review);
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
        await api("POST", "/api/reviews", review);
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
    if (review.status === "pending") row.classList.add("is-pending");

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
        markDirty(review.id);
        render();
      };
      reader.readAsDataURL(file);
    });
    photoWrap.appendChild(fileInput);

    const fields = document.createElement("div");
    fields.className = "reviews-editor-row__fields";

    const badges = document.createElement("div");
    badges.className = "reviews-editor-row__badges";
    const statusBadge = document.createElement("span");
    statusBadge.className = "reviews-editor-row__badge" + (review.status === "pending" ? " is-pending" : " is-approved");
    statusBadge.textContent = review.status === "pending" ? "Pendiente" : "Publicada";
    badges.appendChild(statusBadge);
    if (review.submitted_at) {
      const dateBadge = document.createElement("span");
      dateBadge.className = "reviews-editor-row__date";
      dateBadge.textContent = formatDate(review.submitted_at);
      badges.appendChild(dateBadge);
    }
    fields.appendChild(badges);

    const productPhotoWrap = document.createElement("div");
    productPhotoWrap.className = "reviews-editor-row__product-photo";

    const productPhotoLabel = document.createElement("label");
    productPhotoLabel.className = "reviews-editor-row__product-photo-upload";
    if (review.product_photo) {
      const productImg = document.createElement("img");
      productImg.src = review.product_photo;
      productImg.alt = "Foto del producto";
      productPhotoLabel.appendChild(productImg);
    } else {
      const placeholder = document.createElement("span");
      placeholder.textContent = "+ Foto del producto";
      productPhotoLabel.appendChild(placeholder);
    }

    const productFileInput = document.createElement("input");
    productFileInput.type = "file";
    productFileInput.accept = "image/*";
    productFileInput.className = "visually-hidden";
    productFileInput.addEventListener("change", ev => {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        review.product_photo = reader.result;
        markDirty(review.id);
        render();
      };
      reader.readAsDataURL(file);
    });
    productPhotoLabel.appendChild(productFileInput);
    productPhotoWrap.appendChild(productPhotoLabel);

    if (review.product_photo) {
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "reviews-editor-row__product-photo-remove";
      removeBtn.textContent = "Quitar foto";
      removeBtn.addEventListener("click", () => {
        review.product_photo = "";
        markDirty(review.id);
        render();
      });
      productPhotoWrap.appendChild(removeBtn);
    }
    fields.appendChild(productPhotoWrap);

    const top = document.createElement("div");
    top.className = "reviews-editor-row__fields-top";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Nombre";
    nameInput.value = review.name;
    nameInput.addEventListener("input", () => { review.name = nameInput.value; markDirty(review.id); });
    nameInput.addEventListener("blur", () => { render(); });

    const companyInput = document.createElement("input");
    companyInput.type = "text";
    companyInput.placeholder = "Empresa";
    companyInput.value = review.company;
    companyInput.addEventListener("input", () => { review.company = companyInput.value; markDirty(review.id); });

    const ratingSelect = document.createElement("select");
    for (let n = 5; n >= 1; n--) {
      const option = document.createElement("option");
      option.value = String(n);
      option.textContent = starsText(n) + " (" + n + ")";
      if (Number(review.rating || 5) === n) option.selected = true;
      ratingSelect.appendChild(option);
    }
    ratingSelect.addEventListener("change", () => { review.rating = Number(ratingSelect.value); markDirty(review.id); });

    top.appendChild(nameInput);
    top.appendChild(companyInput);
    top.appendChild(ratingSelect);

    const reviewInput = document.createElement("textarea");
    reviewInput.rows = 3;
    reviewInput.placeholder = "Reseña";
    reviewInput.value = review.review;
    reviewInput.addEventListener("input", () => { review.review = reviewInput.value; markDirty(review.id); });

    fields.appendChild(top);
    fields.appendChild(reviewInput);

    const rowActions = document.createElement("div");
    rowActions.className = "reviews-editor-row__actions";

    if (review.status === "pending") {
      const approveBtn = document.createElement("button");
      approveBtn.type = "button";
      approveBtn.className = "reviews-editor-row__approve";
      approveBtn.textContent = "Aprobar";
      approveBtn.addEventListener("click", async () => {
        review.status = "approved";
        try {
          await api("POST", "/api/reviews", review);
          dirtyIds.delete(review.id);
          render();
          UI.showToast("Reseña publicada.");
        } catch (e) {
          review.status = "pending";
          notifyFailure("No se pudo aprobar la reseña.", e);
        }
      });
      rowActions.appendChild(approveBtn);
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "reviews-editor-row__delete";
    deleteBtn.textContent = "Eliminar";
    deleteBtn.addEventListener("click", () => {
      UI.askConfirm(`¿Eliminar la reseña de "${review.name}"?`, async () => {
        try {
          await api("DELETE", "/api/reviews", { id: review.id });
          reviews = reviews.filter(r => r.id !== review.id);
          dirtyIds.delete(review.id);
          render();
          UI.showToast("Reseña eliminada.");
        } catch (e) {
          notifyFailure("No se pudo eliminar.", e);
        }
      });
    });
    rowActions.appendChild(deleteBtn);

    row.appendChild(photoWrap);
    row.appendChild(fields);
    row.appendChild(rowActions);
    return row;
  }

  loadReviews();
})();
