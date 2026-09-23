/* ==========================================================================
   Editor de portafolio — panel de administración (admin.html)
   Lee y guarda en /api/portfolio (base de datos). Estos son los trabajos que
   se ven en "Ver trabajos realizados" (sección Portafolio del sitio público).

   Los campos (foto, título, categoría, descripción) se guardan en memoria
   mientras se editan, y se envían todos juntos al hacer clic en
   "Guardar cambios". Agregar y eliminar siguen siendo inmediatos.

   También permite carga masiva: seleccionar varias fotos a la vez, elegir
   una categoría para todas, y se crean automáticamente (título a partir
   del nombre del archivo). Después se pueden ajustar una por una.

   Cómo usarlo: en una página con:
     <div id="portfolio-editor-root"></div>
     <script src="editor-ui.js"></script>
     <script src="portfolio-editor.js"></script>
   ========================================================================== */

(function () {
  "use strict";

  const UI = window.StyloEditorUI;

  const root = document.getElementById("portfolio-editor-root");
  if (!root) return;

  const CATEGORIES = [
    { value: "bordado", label: "Bordado" },
    { value: "vestuario", label: "Vestuario" },
    { value: "drinkware", label: "Vasos y tazones" },
    { value: "merchandising", label: "Merchandising" }
  ];

  function labelFor(category) {
    const match = CATEGORIES.find(c => c.value === category);
    return match ? match.label : category;
  }

  let works = [];
  let dirtyIds = new Set();
  let pendingBulkFiles = null;

  async function api(method, body) {
    const res = await UI.authFetch("/api/portfolio", {
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

  async function loadWorks() {
    const res = await fetch("/api/portfolio");
    works = res.ok ? await res.json() : [];
    render();
  }

  function uid() {
    return "w" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function titleFromFilename(filename) {
    const base = filename.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();
    if (!base) return "Nuevo trabajo";
    return base.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  }

  function readAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  function updateSaveBtnState() {
    const saveBtn = document.getElementById("portfolio-save-btn");
    if (saveBtn) saveBtn.disabled = dirtyIds.size === 0;
  }

  function markDirty(id) {
    dirtyIds.add(id);
    updateSaveBtnState();
  }

  function render() {
    root.innerHTML = "";

    const list = document.createElement("div");
    list.className = "reviews-editor-list";
    works.forEach(work => list.appendChild(buildRow(work)));
    root.appendChild(list);

    if (pendingBulkFiles) {
      root.appendChild(buildBulkPanel());
    }

    const actions = document.createElement("div");
    actions.className = "catalog-toolbar";

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "catalog-add-btn";
    addBtn.textContent = "+ Agregar trabajo";
    addBtn.addEventListener("click", async () => {
      const work = {
        id: uid(),
        title: "Nuevo trabajo",
        category: "bordado",
        label: labelFor("bordado"),
        image: "assets/portfolio/images/01.webp",
        description: ""
      };
      try {
        await api("POST", work);
        works.push(work);
        render();
        UI.showToast("Trabajo agregado. Sube su foto y edítalo.");
      } catch (e) {
        notifyFailure("No se pudo agregar el trabajo.", e);
      }
    });

    const bulkBtn = document.createElement("button");
    bulkBtn.type = "button";
    bulkBtn.className = "catalog-add-btn";
    bulkBtn.textContent = "+ Carga masiva";
    bulkBtn.addEventListener("click", () => bulkInput.click());

    const bulkInput = document.createElement("input");
    bulkInput.type = "file";
    bulkInput.accept = "image/*";
    bulkInput.multiple = true;
    bulkInput.className = "visually-hidden";
    bulkInput.addEventListener("change", ev => {
      const files = Array.from(ev.target.files || []);
      if (!files.length) return;
      pendingBulkFiles = files;
      render();
    });

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.id = "portfolio-save-btn";
    saveBtn.className = "catalog-edit-bar__save";
    saveBtn.textContent = "Guardar cambios";
    saveBtn.disabled = dirtyIds.size === 0;
    saveBtn.addEventListener("click", saveChanges);

    actions.appendChild(addBtn);
    actions.appendChild(bulkBtn);
    actions.appendChild(bulkInput);
    actions.appendChild(saveBtn);
    root.appendChild(actions);
  }

  function buildBulkPanel() {
    const panel = document.createElement("div");
    panel.className = "portfolio-bulk-panel";

    const count = document.createElement("p");
    count.className = "portfolio-bulk-panel__count";
    count.textContent = pendingBulkFiles.length + " foto" + (pendingBulkFiles.length === 1 ? "" : "s") + " seleccionada" + (pendingBulkFiles.length === 1 ? "" : "s") + ". Elige la categoría para todas (después puedes cambiarla por trabajo):";
    panel.appendChild(count);

    const row = document.createElement("div");
    row.className = "portfolio-bulk-panel__row";

    const categorySelect = document.createElement("select");
    CATEGORIES.forEach(c => {
      const option = document.createElement("option");
      option.value = c.value;
      option.textContent = c.label;
      categorySelect.appendChild(option);
    });
    row.appendChild(categorySelect);

    const confirmBtn = document.createElement("button");
    confirmBtn.type = "button";
    confirmBtn.className = "catalog-edit-bar__save";
    confirmBtn.textContent = "Cargar fotos";
    confirmBtn.addEventListener("click", () => runBulkUpload(categorySelect.value, confirmBtn, cancelBtn));
    row.appendChild(confirmBtn);

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "reviews-editor-row__delete";
    cancelBtn.textContent = "Cancelar";
    cancelBtn.addEventListener("click", () => { pendingBulkFiles = null; render(); });
    row.appendChild(cancelBtn);

    panel.appendChild(row);
    return panel;
  }

  async function runBulkUpload(category, confirmBtn, cancelBtn) {
    const files = pendingBulkFiles;
    const total = files.length;
    confirmBtn.disabled = true;
    cancelBtn.disabled = true;

    let done = 0;
    let failed = 0;

    for (const file of files) {
      confirmBtn.textContent = "Cargando " + (done + 1) + " de " + total + "…";
      try {
        const image = await readAsDataURL(file);
        const work = {
          id: uid(),
          title: titleFromFilename(file.name),
          category: category,
          label: labelFor(category),
          image: image,
          description: ""
        };
        await api("POST", work);
        works.push(work);
        done++;
      } catch (e) {
        failed++;
      }
    }

    pendingBulkFiles = null;
    render();

    if (failed === 0) {
      UI.showToast(done + " foto" + (done === 1 ? "" : "s") + " agregada" + (done === 1 ? "" : "s") + ".");
    } else {
      UI.showToast(done + " foto(s) agregadas, " + failed + " fallaron. Vuelve a intentar con esas.");
    }
  }

  async function saveChanges() {
    if (dirtyIds.size === 0) return;
    const pending = works.filter(w => dirtyIds.has(w.id));
    try {
      for (const work of pending) {
        await api("POST", work);
        dirtyIds.delete(work.id);
      }
      updateSaveBtnState();
      UI.showToast("Cambios guardados.");
    } catch (e) {
      updateSaveBtnState();
      notifyFailure("No se pudieron guardar todos los cambios. Vuelve a intentar.", e);
    }
  }

  function buildRow(work) {
    const row = document.createElement("div");
    row.className = "reviews-editor-row";

    const photoWrap = document.createElement("label");
    photoWrap.className = "reviews-editor-row__photo reviews-editor-row__photo--wide";
    const img = document.createElement("img");
    img.src = work.image;
    img.alt = work.title;
    photoWrap.appendChild(img);
    const photoBtn = document.createElement("span");
    photoBtn.className = "reviews-editor-row__photo-btn";
    photoBtn.textContent = "Cambiar foto";
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
        work.image = reader.result;
        img.src = work.image;
        markDirty(work.id);
      };
      reader.readAsDataURL(file);
    });
    photoWrap.appendChild(fileInput);

    const fields = document.createElement("div");
    fields.className = "reviews-editor-row__fields";

    const top = document.createElement("div");
    top.className = "reviews-editor-row__fields-top reviews-editor-row__fields-top--two";

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.placeholder = "Título";
    titleInput.value = work.title;
    titleInput.addEventListener("input", () => { work.title = titleInput.value; markDirty(work.id); });

    const categorySelect = document.createElement("select");
    CATEGORIES.forEach(c => {
      const option = document.createElement("option");
      option.value = c.value;
      option.textContent = c.label;
      if (c.value === work.category) option.selected = true;
      categorySelect.appendChild(option);
    });
    categorySelect.addEventListener("change", () => {
      work.category = categorySelect.value;
      work.label = labelFor(work.category);
      markDirty(work.id);
    });

    top.appendChild(titleInput);
    top.appendChild(categorySelect);

    const descInput = document.createElement("textarea");
    descInput.rows = 2;
    descInput.placeholder = "Descripción (se muestra al ampliar la foto)";
    descInput.value = work.description || "";
    descInput.addEventListener("input", () => { work.description = descInput.value; markDirty(work.id); });

    fields.appendChild(top);
    fields.appendChild(descInput);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "reviews-editor-row__delete";
    deleteBtn.textContent = "Eliminar";
    deleteBtn.addEventListener("click", () => {
      UI.askConfirm(`¿Eliminar "${work.title}" del portafolio?`, async () => {
        try {
          await api("DELETE", { id: work.id });
          works = works.filter(w => w.id !== work.id);
          dirtyIds.delete(work.id);
          render();
          UI.showToast("Trabajo eliminado.");
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

  loadWorks();
})();
