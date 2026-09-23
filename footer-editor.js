/* ==========================================================================
   Editor de Footer — panel de administración (admin.html)
   Lee y guarda en /api/settings (logo, teléfono, correo, redes sociales y
   copyright). Todo se guarda junto al hacer clic en "Guardar cambios".

   Cómo usarlo: en una página con:
     <div id="footer-editor-root"></div>
     <script src="editor-ui.js"></script>
     <script src="footer-editor.js"></script>
   ========================================================================== */

(function () {
  "use strict";

  const UI = window.StyloEditorUI;

  const root = document.getElementById("footer-editor-root");
  if (!root) return;

  let settings = {};
  let dirty = false;

  function markDirty() {
    dirty = true;
    const saveBtn = document.getElementById("footer-save-btn");
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

  function field(labelText, key) {
    const wrap = document.createElement("div");
    wrap.className = "site-editor-field";

    const label = document.createElement("label");
    label.textContent = labelText;
    wrap.appendChild(label);

    const input = document.createElement("input");
    input.type = "text";
    input.value = settings[key] || "";
    input.addEventListener("input", () => { settings[key] = input.value; markDirty(); });
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
    grid.appendChild(imageField("Logo del footer", "footer_logo"));
    grid.appendChild(field("Teléfono", "footer_phone"));
    grid.appendChild(field("Correo", "footer_email"));
    grid.appendChild(field("Facebook (link)", "footer_social_facebook"));
    grid.appendChild(field("Instagram (link)", "footer_social_instagram"));
    grid.appendChild(field("Linkedin (link)", "footer_social_linkedin"));
    grid.appendChild(field("Twitter (link)", "footer_social_twitter"));
    grid.appendChild(field("Pinterest (link)", "footer_social_pinterest"));
    grid.appendChild(field("Texto de copyright", "footer_copyright"));
    root.appendChild(grid);

    const actions = document.createElement("div");
    actions.className = "catalog-toolbar";
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.id = "footer-save-btn";
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
