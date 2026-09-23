/* ==========================================================================
   Editor de TODOS los textos del sitio — panel de administración
   (admin.html). Lee y guarda en /api/settings (la misma tabla clave/valor
   que usa el editor de Header y Footer).

   Cómo usarlo: en una página con:
     <div id="textos-editor-root"></div>
     <script src="editor-ui.js"></script>
     <script src="textos-editor.js"></script>
   ========================================================================== */

(function () {
  "use strict";

  const UI = window.StyloEditorUI;

  const root = document.getElementById("textos-editor-root");
  if (!root) return;

  // Cada grupo es una sección del sitio. type: "text" (una línea),
  // "textarea" (párrafo normal) o "textarea-html" (como el título del hero:
  // permite un salto de línea que se guarda como <br>).
  const GROUPS = [
    {
      title: "Menú",
      fields: [
        { key: "nav_inicio", label: "Inicio" },
        { key: "nav_servicios", label: "Servicios" },
        { key: "nav_catalogo", label: "Catálogo" },
        { key: "nav_clientes", label: "Clientes" },
        { key: "nav_galeria", label: "Galería" },
        { key: "nav_cotizar", label: "Botón Cotizar" }
      ]
    },
    {
      title: "Servicios (sección bajo el hero)",
      fields: [
        { key: "intro_kicker", label: "Texto superior", type: "textarea" },
        { key: "intro_title", label: "Título" },
        { key: "intro_desc1", label: "Párrafo 1", type: "textarea" },
        { key: "intro_desc2", label: "Párrafo 2", type: "textarea" },
        { key: "stat1_label", label: "Estadística 1" },
        { key: "stat2_label", label: "Estadística 2" },
        { key: "stat3_label", label: "Estadística 3" }
      ]
    },
    {
      title: "Nuestro Trabajo",
      fields: [
        { key: "catalogo_title", label: "Título de la sección" }
      ]
    },
    {
      title: "Proceso de Pedido",
      fields: [
        { key: "cta_kicker", label: "Texto superior" },
        { key: "cta_title", label: "Título" },
        { key: "cta_button", label: "Botón" },
        { key: "cta_step1_title", label: "Paso 1 — título" },
        { key: "cta_step1_desc", label: "Paso 1 — descripción" },
        { key: "cta_step2_title", label: "Paso 2 — título" },
        { key: "cta_step2_desc", label: "Paso 2 — descripción" },
        { key: "cta_step3_title", label: "Paso 3 — título" },
        { key: "cta_step3_desc", label: "Paso 3 — descripción" }
      ]
    },
    {
      title: "Portafolio",
      fields: [
        { key: "portfolio_toggle_eyebrow", label: "Acordeón — texto superior" },
        { key: "portfolio_toggle_text", label: "Acordeón — texto del botón" },
        { key: "portfolio_heading_eyebrow", label: "Texto superior" },
        { key: "portfolio_heading_title", label: "Título (Enter = salto de línea)", type: "textarea-html" },
        { key: "portfolio_heading_desc", label: "Descripción", type: "textarea" },
        { key: "portfolio_filter_todos", label: "Filtro: Todos" },
        { key: "portfolio_filter_bordado", label: "Filtro: Bordado" },
        { key: "portfolio_filter_vestuario", label: "Filtro: Vestuario" },
        { key: "portfolio_filter_drinkware", label: "Filtro: Vasos y tazones" },
        { key: "portfolio_filter_merchandising", label: "Filtro: Merchandising" },
        { key: "portfolio_empty_text", label: "Mensaje sin resultados" },
        { key: "portfolio_empty_button", label: "Botón sin resultados" },
        { key: "portfolio_modal_cta", label: "Botón en vista ampliada" }
      ]
    },
    {
      title: "Reseñas",
      fields: [
        { key: "resenas_kicker", label: "Texto superior" },
        { key: "resenas_title", label: "Título" },
        { key: "resenas_desc", label: "Descripción", type: "textarea" },
        { key: "resenas_button", label: "Botón" }
      ]
    },
    {
      title: "Formulario rápido (botón Contáctanos del hero)",
      fields: [
        { key: "contact_modal_title", label: "Título" },
        { key: "contact_modal_desc", label: "Descripción" }
      ]
    },
    {
      title: "Contacto",
      fields: [
        { key: "contacto_title", label: "Título" },
        { key: "contacto_desc", label: "Descripción", type: "textarea" },
        { key: "contacto_form_nombre", label: "Campo: Nombre" },
        { key: "contacto_form_apellido", label: "Campo: Apellido" },
        { key: "contacto_form_email", label: "Campo: Email" },
        { key: "contacto_form_empresa", label: "Campo: Empresa" },
        { key: "contacto_form_telefono", label: "Campo: Teléfono" },
        { key: "contacto_form_mensaje", label: "Campo: Mensaje" },
        { key: "contacto_attach_label", label: "Botón adjuntar archivo" },
        { key: "contacto_submit_button", label: "Botón enviar" }
      ]
    },
    {
      title: "Footer",
      fields: [
        { key: "footer_col1_heading", label: "Columna 1 — título" },
        { key: "footer_col1_link1", label: "Columna 1 — link 1" },
        { key: "footer_col1_link2", label: "Columna 1 — link 2" },
        { key: "footer_col1_link3", label: "Columna 1 — link 3" },
        { key: "footer_col1_link4", label: "Columna 1 — link 4" },
        { key: "footer_col2_heading", label: "Columna 2 — título" },
        { key: "footer_col2_link1", label: "Columna 2 — link 1" },
        { key: "footer_col2_link2", label: "Columna 2 — link 2" },
        { key: "footer_col3_heading", label: "Columna 3 — título" },
        { key: "footer_col3_link1", label: "Columna 3 — link 1" },
        { key: "footer_col3_link2", label: "Columna 3 — link 2" },
        { key: "footer_col3_link3", label: "Columna 3 — link 3" }
      ]
    },
    {
      title: "Panel de cotización (carrito del catálogo)",
      fields: [
        { key: "quote_fab_text", label: "Botón flotante" },
        { key: "quote_drawer_eyebrow", label: "Texto superior" },
        { key: "quote_drawer_title", label: "Título" },
        { key: "quote_drawer_empty", label: "Mensaje vacío", type: "textarea" },
        { key: "quote_drawer_submit", label: "Botón enviar" },
        { key: "quote_drawer_note", label: "Nota al pie", type: "textarea" }
      ]
    }
  ];

  let settings = {};
  let dirty = false;

  function markDirty() {
    dirty = true;
    const saveBtn = document.getElementById("textos-save-btn");
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

  function field(def) {
    const wrap = document.createElement("div");
    wrap.className = "site-editor-field";

    const label = document.createElement("label");
    label.textContent = def.label;
    wrap.appendChild(label);

    const isTextarea = def.type === "textarea" || def.type === "textarea-html";
    const input = isTextarea ? document.createElement("textarea") : document.createElement("input");
    if (!isTextarea) input.type = "text";
    else input.rows = def.type === "textarea-html" ? 2 : 3;

    const raw = settings[def.key] || "";
    input.value = def.type === "textarea-html" ? raw.replace(/<br\s*\/?>/gi, "\n") : raw;

    input.addEventListener("input", () => {
      settings[def.key] = def.type === "textarea-html" ? input.value.replace(/\n/g, "<br>") : input.value;
      markDirty();
    });
    wrap.appendChild(input);

    return wrap;
  }

  function render() {
    root.innerHTML = "";

    GROUPS.forEach(group => {
      const section = document.createElement("div");
      section.className = "textos-editor-group";

      const heading = document.createElement("h3");
      heading.className = "textos-editor-group__title";
      heading.textContent = group.title;
      section.appendChild(heading);

      const grid = document.createElement("div");
      grid.className = "site-editor-grid";
      group.fields.forEach(def => grid.appendChild(field(def)));
      section.appendChild(grid);

      root.appendChild(section);
    });

    const actions = document.createElement("div");
    actions.className = "catalog-toolbar";
    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.id = "textos-save-btn";
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
