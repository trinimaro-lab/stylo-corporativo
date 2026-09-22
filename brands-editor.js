/* ==========================================================================
   Editor de "Marcas que confían en nosotros" — panel de administración
   (admin.html). Lee y guarda en /api/brands (título, descripción, foto
   colage) y /api/brand-logos (grid de logos de clientes).

   Los campos se guardan en memoria mientras se editan, y se envían todos
   juntos al hacer clic en "Guardar cambios". Agregar y eliminar logos
   siguen siendo inmediatos.

   Cómo usarlo: en una página con:
     <div id="brands-editor-root"></div>
     <script src="editor-ui.js"></script>
     <script src="brands-editor.js"></script>
   ========================================================================== */

(function () {
  "use strict";

  const UI = window.StyloEditorUI;

  const root = document.getElementById("brands-editor-root");
  if (!root) return;

  let section = { title: "", description: "", collageImage: "" };
  let logos = [];
  let sectionDirty = false;
  let dirtyLogoIds = new Set();

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

  function uid() {
    return "b" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function updateSaveBtnState() {
    const saveBtn = document.getElementById("brands-save-btn");
    if (saveBtn) saveBtn.disabled = !sectionDirty && dirtyLogoIds.size === 0;
  }

  function markSectionDirty() {
    sectionDirty = true;
    updateSaveBtnState();
  }

  function markLogoDirty(id) {
    dirtyLogoIds.add(id);
    updateSaveBtnState();
  }

  async function load() {
    const [sectionRes, logosRes] = await Promise.all([
      UI.authFetch("/api/brands"),
      UI.authFetch("/api/brand-logos")
    ]);
    section = sectionRes.ok ? (await sectionRes.json()) || section : section;
    logos = logosRes.ok ? await logosRes.json() : [];
    render();
  }

  function render() {
    root.innerHTML = "";

    const sectionFields = document.createElement("div");
    sectionFields.className = "brands-editor-section-fields";

    const titleInput = document.createElement("input");
    titleInput.type = "text";
    titleInput.placeholder = "Título de la sección";
    titleInput.value = section.title || "";
    titleInput.addEventListener("input", () => { section.title = titleInput.value; markSectionDirty(); });

    const descInput = document.createElement("textarea");
    descInput.rows = 4;
    descInput.placeholder = "Descripción";
    descInput.value = section.description || "";
    descInput.addEventListener("input", () => { section.description = descInput.value; markSectionDirty(); });

    const collageWrap = document.createElement("div");
    collageWrap.className = "brands-editor-collage";
    const collageLabel = document.createElement("label");
    collageLabel.className = "brands-editor-collage__upload";
    if (section.collageImage) {
      const img = document.createElement("img");
      img.src = section.collageImage;
      img.alt = "Foto colage";
      collageLabel.appendChild(img);
    } else {
      const span = document.createElement("span");
      span.textContent = "+ Foto colage";
      collageLabel.appendChild(span);
    }
    const collageInput = document.createElement("input");
    collageInput.type = "file";
    collageInput.accept = "image/*";
    collageInput.className = "visually-hidden";
    collageInput.addEventListener("change", ev => {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        section.collageImage = reader.result;
        markSectionDirty();
        render();
      };
      reader.readAsDataURL(file);
    });
    collageLabel.appendChild(collageInput);
    collageWrap.appendChild(collageLabel);
    const collageHint = document.createElement("p");
    collageHint.className = "admin-hint";
    collageHint.style.margin = "6px 0 0";
    collageHint.textContent = "Foto grande junto al texto.";
    collageWrap.appendChild(collageHint);

    sectionFields.appendChild(titleInput);
    sectionFields.appendChild(descInput);
    sectionFields.appendChild(collageWrap);
    root.appendChild(sectionFields);

    const logosHeading = document.createElement("h3");
    logosHeading.className = "brands-editor-logos-heading";
    logosHeading.textContent = "Logos de marcas";
    root.appendChild(logosHeading);

    const logosGrid = document.createElement("div");
    logosGrid.className = "brands-editor-logos-grid";
    logos.forEach(logo => logosGrid.appendChild(buildLogoCard(logo)));
    root.appendChild(logosGrid);

    const actions = document.createElement("div");
    actions.className = "catalog-toolbar";

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "catalog-add-btn";
    addBtn.textContent = "+ Agregar marca";
    addBtn.addEventListener("click", async () => {
      const logo = { id: uid(), image: "assets/brands/brand-1.png", alt: "Marca cliente" };
      try {
        await api("POST", "/api/brand-logos", logo);
        logos.push(logo);
        render();
        UI.showToast("Marca agregada. Sube su logo.");
      } catch (e) {
        notifyFailure("No se pudo agregar la marca.", e);
      }
    });

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.id = "brands-save-btn";
    saveBtn.className = "catalog-edit-bar__save";
    saveBtn.textContent = "Guardar cambios";
    saveBtn.disabled = !sectionDirty && dirtyLogoIds.size === 0;
    saveBtn.addEventListener("click", saveChanges);

    actions.appendChild(addBtn);
    actions.appendChild(saveBtn);
    root.appendChild(actions);
  }

  function buildLogoCard(logo) {
    const card = document.createElement("div");
    card.className = "brands-editor-logo-card";

    const uploadLabel = document.createElement("label");
    uploadLabel.className = "brands-editor-logo-card__upload";
    const img = document.createElement("img");
    img.src = logo.image;
    img.alt = logo.alt || "";
    uploadLabel.appendChild(img);

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.className = "visually-hidden";
    fileInput.addEventListener("change", ev => {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        logo.image = reader.result;
        img.src = logo.image;
        markLogoDirty(logo.id);
      };
      reader.readAsDataURL(file);
    });
    uploadLabel.appendChild(fileInput);
    card.appendChild(uploadLabel);

    const altInput = document.createElement("input");
    altInput.type = "text";
    altInput.placeholder = "Nombre de la marca";
    altInput.value = logo.alt || "";
    altInput.addEventListener("input", () => { logo.alt = altInput.value; markLogoDirty(logo.id); });
    card.appendChild(altInput);

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "brands-editor-logo-card__delete";
    deleteBtn.textContent = "Eliminar";
    deleteBtn.addEventListener("click", () => {
      UI.askConfirm("¿Eliminar este logo?", async () => {
        try {
          await api("DELETE", "/api/brand-logos", { id: logo.id });
          logos = logos.filter(l => l.id !== logo.id);
          dirtyLogoIds.delete(logo.id);
          render();
          UI.showToast("Logo eliminado.");
        } catch (e) {
          notifyFailure("No se pudo eliminar.", e);
        }
      });
    });
    card.appendChild(deleteBtn);

    return card;
  }

  async function saveChanges() {
    try {
      if (sectionDirty) {
        await api("POST", "/api/brands", section);
        sectionDirty = false;
      }
      const pendingLogos = logos.filter(l => dirtyLogoIds.has(l.id));
      for (const logo of pendingLogos) {
        await api("POST", "/api/brand-logos", logo);
        dirtyLogoIds.delete(logo.id);
      }
      updateSaveBtnState();
      UI.showToast("Cambios guardados.");
    } catch (e) {
      updateSaveBtnState();
      notifyFailure("No se pudieron guardar todos los cambios. Vuelve a intentar.", e);
    }
  }

  load();
})();
