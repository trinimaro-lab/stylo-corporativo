/* ==========================================================================
   Editor de Header — panel de administración (admin.html)
   Lee y guarda en /api/settings (logo, foto de fondo del hero y sus
   textos). Todo se guarda junto al hacer clic en "Guardar cambios".

   Cómo usarlo: en una página con:
     <div id="header-editor-root"></div>
     <script src="editor-ui.js"></script>
     <script src="header-editor.js"></script>
   ========================================================================== */

(function () {
  "use strict";

  const UI = window.StyloEditorUI;

  const root = document.getElementById("header-editor-root");
  if (!root) return;

  let settings = {};
  let dirty = false;

  function markDirty() {
    dirty = true;
    const saveBtn = document.getElementById("header-save-btn");
    if (saveBtn) saveBtn.disabled = false;
  }

  async function load() {
    try {
      const res = await fetch("/api/settings");
      settings = res.ok ? await res.json() : {};
    } catch (e) {
      settings = {};
    }
    render();
  }

  function field(labelText, key, opts) {
    opts = opts || {};
    const wrap = document.createElement("div");
    wrap.className = "site-editor-field";

    const label = document.createElement("label");
    label.textContent = labelText;
    wrap.appendChild(label);

    const input = opts.textarea ? document.createElement("textarea") : document.createElement("input");
    if (!opts.textarea) input.type = "text";
    else input.rows = 2;
    input.value = opts.textarea ? (settings[key] || "").replace(/<br\s*\/?>/gi, "\n") : (settings[key] || "");
    input.addEventListener("input", () => {
      settings[key] = opts.textarea ? input.value.replace(/\n/g, "<br>") : input.value;
      markDirty();
    });
    wrap.appendChild(input);

    return wrap;
  }

  function imageField(labelText, key) {
    const wrap = document.createElement("div");
    wrap.className = "site-editor-field";

    const label = document.createElement("label");
    label.textContent = labelText;
    wrap.appendChild(label);

    const uploadLabel = document.createElement("label");
    uploadLabel.className = "site-editor-image-upload";
    if (settings[key]) {
      const img = document.createElement("img");
      img.src = settings[key];
      uploadLabel.appendChild(img);
    } else {
      const span = document.createElement("span");
      span.textContent = "+ Subir imagen";
      uploadLabel.appendChild(span);
    }

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.className = "visually-hidden";
    fileInput.addEventListener("change", ev => {
      const file = ev.target.files && ev.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        settings[key] = reader.result;
        markDirty();
        render();
      };
      reader.readAsDataURL(file);
    });
    uploadLabel.appendChild(fileInput);
    wrap.appendChild(uploadLabel);

    return wrap;
  }

  function render() {
    root.innerHTML = "";

    const grid = document.createElement("div");
    grid.className = "site-editor-grid";
    grid.appendChild(imageField("Logo (menú superior)", "header_logo"));
    grid.appendChild(imageField("Foto de fondo del hero", "header_hero_image"));
    grid.appendChild(field("Texto sobre el título", "header_hero_kicker"));
    grid.appendChild(field("Título principal", "header_hero_title", { textarea: true }));
    grid.appendChild(field("Placeholder del buscador", "header_hero_placeholder"));
    grid.appendChild(field("Texto del botón", "header_hero_button"));
    root.appendChild(grid);

    const actions = document.createElement("div");
    actions.className = "catalog-toolbar";
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.id = "header-save-btn";
    saveBtn.className = "catalog-edit-bar__save";
    saveBtn.textContent = "Guardar cambios";
    saveBtn.disabled = !dirty;
    saveBtn.addEventListener("click", saveChanges);
    actions.appendChild(saveBtn);
    root.appendChild(actions);
  }

  async function saveChanges() {
    try {
      const res = await UI.authFetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (!res.ok) {
        if (res.status !== 401) UI.showToast("No se pudieron guardar los cambios. Vuelve a intentar.");
        return;
      }
      dirty = false;
      render();
      UI.showToast("Cambios guardados.");
    } catch (e) {
      UI.showToast("No se pudieron guardar los cambios. Vuelve a intentar.");
    }
  }

  load();
})();
