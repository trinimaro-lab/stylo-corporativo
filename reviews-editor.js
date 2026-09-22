/* ==========================================================================
   Editor de reseñas — panel de administración (NO enlazado a index.html).
   Guarda en el mismo localStorage que lee reviews-marquee.js
   ("stylo_resenas_v2"), con foto, nombre, reseña y empresa por cliente.

   Cómo usarlo: crea una página aparte (o una sección del futuro panel de
   administración) con:
     <div id="reviews-editor-root"></div>
     <script src="editor-ui.js"></script>
     <script src="reviews-editor.js"></script>
   y este script arma ahí la lista editable.
   ========================================================================== */

(function () {
  "use strict";

  const UI = window.StyloEditorUI;
  const STORAGE_KEY = "stylo_resenas_v2";

  const DEFAULT_REVIEWS = [
    {
      id: "r1",
      name: "Revivir",
      company: "",
      review: "El trabajo de Stylo Corporativo me pareció realmente excelente. Desataco su atención amable y personalizada, y la calidad de las poleras y gorros. Un muy buen trabajo. La recomiendo 100%.",
      photo: ""
    }
  ];

  const root = document.getElementById("reviews-editor-root");
  if (!root) return;

  function cloneDefaults() {
    return DEFAULT_REVIEWS.map(r => ({ id: r.id, name: r.name, company: r.company, review: r.review, photo: r.photo }));
  }

  function loadReviews() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) {}
    return cloneDefaults();
  }

  let reviews = loadReviews();

  function saveReviews() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
    } catch (e) {
      UI.showToast("No se pudo guardar (almacenamiento local lleno o bloqueado).");
    }
  }

  function uid() {
    return "r" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function initials(name) {
    return (name || "?").trim().charAt(0).toUpperCase();
  }

  function render() {
    root.innerHTML = "";

    const list = document.createElement("div");
    list.className = "reviews-editor-list";
    reviews.forEach(review => list.appendChild(buildRow(review)));
    root.appendChild(list);

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "catalog-add-btn";
    addBtn.textContent = "+ Agregar reseña";
    addBtn.addEventListener("click", () => {
      reviews.push({ id: uid(), name: "Nombre del cliente", company: "", review: "Escribe aquí la reseña.", photo: "" });
      saveReviews();
      render();
    });

    const resetBtn = document.createElement("button");
    resetBtn.type = "button";
    resetBtn.id = "reviews-editor-reset";
    resetBtn.textContent = "Restablecer diseño original";
    resetBtn.addEventListener("click", () => {
      UI.askConfirm("¿Restablecer las reseñas al diseño original? Se perderán tus cambios.", () => {
        reviews = cloneDefaults();
        saveReviews();
        render();
        UI.showToast("Reseñas restablecidas.");
      });
    });

    const actions = document.createElement("div");
    actions.className = "catalog-toolbar";
    actions.appendChild(addBtn);
    actions.appendChild(resetBtn);
    root.appendChild(actions);
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
        saveReviews();
        render();
        UI.showToast("Foto actualizada.");
      };
      reader.readAsDataURL(file);
    });
    photoWrap.appendChild(fileInput);

    const fields = document.createElement("div");
    fields.className = "reviews-editor-row__fields";

    const top = document.createElement("div");
    top.className = "reviews-editor-row__fields-top";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.placeholder = "Nombre";
    nameInput.value = review.name;
    nameInput.addEventListener("input", () => { review.name = nameInput.value; saveReviews(); });
    nameInput.addEventListener("blur", render);

    const companyInput = document.createElement("input");
    companyInput.type = "text";
    companyInput.placeholder = "Empresa";
    companyInput.value = review.company;
    companyInput.addEventListener("input", () => { review.company = companyInput.value; saveReviews(); });

    top.appendChild(nameInput);
    top.appendChild(companyInput);

    const reviewInput = document.createElement("textarea");
    reviewInput.rows = 3;
    reviewInput.placeholder = "Reseña";
    reviewInput.value = review.review;
    reviewInput.addEventListener("input", () => { review.review = reviewInput.value; saveReviews(); });

    fields.appendChild(top);
    fields.appendChild(reviewInput);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "reviews-editor-row__delete";
    deleteBtn.textContent = "Eliminar";
    deleteBtn.addEventListener("click", () => {
      UI.askConfirm(`¿Eliminar la reseña de "${review.name}"?`, () => {
        reviews = reviews.filter(r => r.id !== review.id);
        saveReviews();
        render();
        UI.showToast("Reseña eliminada.");
      });
    });

    row.appendChild(photoWrap);
    row.appendChild(fields);
    row.appendChild(deleteBtn);
    return row;
  }

  render();
})();
