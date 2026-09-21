/* ==========================================================================
   Cotización desde "Nuestro Trabajo"
   Cada foto del catálogo tiene un botón "+" para agregarla a una
   cotización. El panel lateral junta la selección y un formulario de
   contacto; al enviarlo arma un resumen para compartir por WhatsApp,
   correo o el sistema de compartir del dispositivo.
   ========================================================================== */

(function () {
  "use strict";

  const grid = document.getElementById("product-grid");
  const drawer = document.getElementById("quote-drawer");
  const backdrop = document.getElementById("quote-backdrop");
  const selectedList = document.getElementById("quote-selected-list");
  const selectedEmpty = document.getElementById("quote-selected-empty");
  const fab = document.getElementById("quote-fab");
  const fabCount = document.getElementById("quote-fab-count");
  const closeBtn = document.getElementById("quote-drawer-close");
  const form = document.getElementById("quote-drawer-form");

  if (!grid || !drawer) return;

  const selected = new Map();

  function cardsList() {
    return Array.from(grid.querySelectorAll(".product-card"));
  }

  function toggleSelection(card) {
    const id = card.dataset.id;
    const title = card.dataset.title;
    const image = card.querySelector("img").getAttribute("src");
    const btn = card.querySelector(".product-card__add-btn");

    if (selected.has(id)) {
      selected.delete(id);
      btn.classList.remove("is-selected");
      btn.textContent = "+";
      btn.setAttribute("aria-pressed", "false");
      showToast("Quitado de tu cotización");
    } else {
      selected.set(id, { id, title, image });
      btn.classList.add("is-selected");
      btn.textContent = "✓";
      btn.setAttribute("aria-pressed", "true");
      showToast("Agregado a tu cotización");
      openDrawer();
    }

    renderSelected();
  }

  function renderSelected() {
    const items = Array.from(selected.values());

    fabCount.textContent = items.length;
    fab.hidden = items.length === 0;
    selectedEmpty.hidden = items.length > 0;

    selectedList.innerHTML = items.map(item => `
      <div class="quote-selected-item">
        <img src="${item.image}" alt="">
        <strong>${item.title}</strong>
        <button type="button" data-remove="${item.id}" aria-label="Quitar ${item.title}">×</button>
      </div>
    `).join("");
  }

  function openDrawer() {
    backdrop.hidden = false;
    requestAnimationFrame(() => drawer.classList.add("is-open"));
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("quote-no-scroll");
  }

  function closeDrawer() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("quote-no-scroll");
    setTimeout(() => { backdrop.hidden = true; }, 300);
  }

  let toastTimer;
  function showToast(message) {
    let toast = document.getElementById("catalog-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "catalog-toast";
      toast.className = "catalog-toast";
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  grid.addEventListener("click", event => {
    const btn = event.target.closest(".product-card__add-btn");
    if (!btn) return;
    toggleSelection(btn.closest(".product-card"));
  });

  fab.addEventListener("click", openDrawer);
  closeBtn.addEventListener("click", closeDrawer);
  backdrop.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && drawer.classList.contains("is-open")) closeDrawer();
  });

  selectedList.addEventListener("click", event => {
    const btn = event.target.closest("[data-remove]");
    if (!btn) return;
    const card = cardsList().find(c => c.dataset.id === btn.dataset.remove);
    if (card) toggleSelection(card);
  });

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const items = Array.from(selected.values());
    const references = items.length
      ? items.map(item => `• ${item.title}`).join("\n")
      : "• Sin servicios seleccionados";

    const summary = [
      "Solicitud de cotización — Stylo Corporativo",
      "",
      `Nombre: ${data.get("nombre")}`,
      `Empresa: ${data.get("empresa") || "No indicada"}`,
      `Contacto: ${data.get("contacto")}`,
      "",
      "Servicios de interés:",
      references,
      "",
      `Detalle: ${data.get("detalle") || "Sin detalle adicional"}`
    ].join("\n");

    try {
      if (navigator.share) {
        await navigator.share({ title: "Solicitud de cotización — Stylo Corporativo", text: summary });
        showToast("Solicitud lista para compartir");
      } else {
        await navigator.clipboard.writeText(summary);
        showToast("Solicitud copiada para enviarla por correo o WhatsApp");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        await navigator.clipboard.writeText(summary);
        showToast("Solicitud copiada al portapapeles");
      }
    }
  });

  renderSelected();
})();
