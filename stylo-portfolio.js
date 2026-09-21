(() => {
  const IMAGE_PATH = "assets/portfolio/images/";

  const works = [
    { id: "01", title: "Bordado institucional", category: "bordado", label: "Bordado", image: "01.webp", description: "Detalle de bordado aplicado sobre prenda, con lectura clara y terminación precisa." },
    { id: "02", title: "Producción para evento", category: "bordado", label: "Bordado", image: "02.webp", description: "Preparación coordinada de piezas personalizadas para una experiencia corporativa." },
    { id: "03", title: "Jockey corporativo", category: "bordado", label: "Bordado", image: "03.webp", description: "Logotipo multicolor bordado en jockey de visera plana." },
    { id: "04", title: "Polera piqué bordada", category: "vestuario", label: "Vestuario", image: "04.webp", description: "Polera corporativa oscura con bordado compacto de marca." },
    { id: "05", title: "Polera gráfica Chile", category: "vestuario", label: "Vestuario", image: "05.webp", description: "Aplicación gráfica de gran formato sobre polera blanca." },
    { id: "06", title: "Polera personalizada", category: "vestuario", label: "Vestuario", image: "06.webp", description: "Diseño de personajes y gráfica personalizada sobre textil de color." },
    { id: "07", title: "Activación de marca", category: "merchandising", label: "Merchandising", image: "07.webp", description: "Línea coordinada de botellas, vasos y textiles para una activación." },
    { id: "08", title: "Termo personalizado", category: "drinkware", label: "Vasos y tazones", image: "08.webp", description: "Personalización envolvente aplicada sobre termo para regalo o evento." },
    { id: "09", title: "Polera temática", category: "vestuario", label: "Vestuario", image: "09.webp", description: "Estampado de temporada aplicado en una prenda de alto impacto visual." },
    { id: "10", title: "Tazones estampados", category: "drinkware", label: "Vasos y tazones", image: "10.webp", description: "Colección de tazones con fotografías e ilustraciones personalizadas." },
    { id: "11", title: "Colección promocional", category: "merchandising", label: "Merchandising", image: "11.webp", description: "Selección de objetos personalizados para regalos y venta especial." },
    { id: "13", title: "Pack para celebración", category: "merchandising", label: "Merchandising", image: "13.webp", description: "Mix de tazones y poleras preparado para una fecha especial." },
    { id: "14", title: "Línea de vasos", category: "drinkware", label: "Vasos y tazones", image: "14.webp", description: "Producción variada de vasos personalizados, lista para exhibición." },
    { id: "15", title: "Tote bag personalizada", category: "merchandising", label: "Merchandising", image: "15.webp", description: "Bolso textil con aplicación gráfica, pensado como recuerdo o regalo." },
    { id: "16", title: "Merchandising de celebración", category: "merchandising", label: "Merchandising", image: "16.webp", description: "Piezas coordinadas para celebración, recuerdo y experiencia de marca." },
    { id: "17", title: "Vasos personalizados", category: "drinkware", label: "Vasos y tazones", image: "17.webp", description: "Vasos con identidad gráfica consistente para evento o regalo." },
    { id: "18", title: "Producción de cristalería", category: "drinkware", label: "Vasos y tazones", image: "18.webp", description: "Producción amplia de vasos personalizados con múltiples diseños." },
    { id: "19", title: "Bordado de personaje", category: "bordado", label: "Bordado", image: "19.webp", description: "Bordado multicolor de personaje con definición en detalles pequeños." },
    { id: "20", title: "Bordado sobre polera", category: "bordado", label: "Bordado", image: "20.webp", description: "Aplicación bordada de alta presencia sobre una prenda oscura." }
  ];

  const portfolio = document.querySelector("#stylo-portafolio");
  if (!portfolio) return;

  const state = { filter: "todos", selected: new Set(), activeWork: null };
  const grid = document.querySelector("#stylo-grid");
  const resultCount = document.querySelector("#stylo-result-count");
  const selectionCount = document.querySelector("#stylo-selection-count");
  const emptyState = document.querySelector("#stylo-empty");
  const drawer = document.querySelector("#stylo-quote");
  const backdrop = document.querySelector("#stylo-backdrop");
  const selectedList = document.querySelector("#stylo-selected-list");
  const selectionEmpty = document.querySelector("#stylo-selection-empty");
  const modal = document.querySelector("#stylo-modal");
  const toast = document.querySelector("#stylo-toast");

  function imageUrl(file) {
    return `${IMAGE_PATH}${file}`;
  }

  function renderCards() {
    grid.innerHTML = works.map(work => `
      <article class="stylo-card" tabindex="0" data-id="${work.id}" aria-label="Ver ${work.title}">
        <img src="${imageUrl(work.image)}" alt="${work.title}" loading="lazy" decoding="async">
        <div class="stylo-card-copy">
          <span>${work.label}</span>
          <strong>${work.title}</strong>
        </div>
        <button class="stylo-card-add" type="button" data-add="${work.id}" aria-label="Agregar ${work.title} a la cotización">+</button>
      </article>
    `).join("");

    applyFilters();
    updateSelection();
  }

  function applyFilters() {
    let visible = 0;

    grid.querySelectorAll(".stylo-card").forEach(card => {
      const work = works.find(item => item.id === card.dataset.id);
      const categoryMatches = state.filter === "todos" || work.category === state.filter;

      card.hidden = !categoryMatches;
      if (!card.hidden) visible += 1;
    });

    resultCount.textContent = visible;
    emptyState.hidden = visible !== 0;
  }

  function openModal(work) {
    state.activeWork = work;
    document.querySelector("#stylo-modal-image").src = imageUrl(work.image);
    document.querySelector("#stylo-modal-image").alt = work.title;
    document.querySelector("#stylo-modal-category").textContent = work.label;
    document.querySelector("#stylo-modal-title").textContent = work.title;
    document.querySelector("#stylo-modal-description").textContent = work.description;
    updateModalButton();
    modal.showModal();
  }

  function updateModalButton() {
    const button = document.querySelector("#stylo-modal-add");
    const selected = state.activeWork && state.selected.has(state.activeWork.id);
    button.textContent = selected ? "Quitar de la cotización" : "Agregar a cotización";
  }

  function toggleSelection(id) {
    if (state.selected.has(id)) {
      state.selected.delete(id);
      showToast("Quitado de tu selección");
    } else {
      state.selected.add(id);
      showToast("Agregado a tu cotización");
    }

    updateSelection();
  }

  function updateSelection() {
    const selectedWorks = works.filter(work => state.selected.has(work.id));
    selectionCount.textContent = selectedWorks.length;
    selectionEmpty.hidden = selectedWorks.length > 0;

    grid.querySelectorAll("[data-add]").forEach(button => {
      const selected = state.selected.has(button.dataset.add);
      button.classList.toggle("is-selected", selected);
      button.textContent = selected ? "✓" : "+";
      button.setAttribute("aria-pressed", String(selected));
    });

    selectedList.innerHTML = selectedWorks.map(work => `
      <div class="stylo-selected-item">
        <img src="${imageUrl(work.image)}" alt="">
        <div>
          <strong>${work.title}</strong>
          <small>${work.label}</small>
        </div>
        <button type="button" data-remove="${work.id}" aria-label="Quitar ${work.title}">×</button>
      </div>
    `).join("");

    updateModalButton();
  }

  function openQuote() {
    backdrop.hidden = false;
    requestAnimationFrame(() => drawer.classList.add("is-open"));
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("stylo-no-scroll");
  }

  function closeQuote() {
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("stylo-no-scroll");
    setTimeout(() => { backdrop.hidden = true; }, 300);
  }

  let toastTimer;
  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
  }

  grid.addEventListener("click", event => {
    const addButton = event.target.closest("[data-add]");
    if (addButton) {
      event.stopPropagation();
      toggleSelection(addButton.dataset.add);
      return;
    }

    const card = event.target.closest(".stylo-card");
    if (card) openModal(works.find(work => work.id === card.dataset.id));
  });

  grid.addEventListener("keydown", event => {
    if ((event.key === "Enter" || event.key === " ") && event.target.classList.contains("stylo-card")) {
      event.preventDefault();
      openModal(works.find(work => work.id === event.target.dataset.id));
    }
  });

  portfolio.querySelectorAll(".stylo-filter").forEach(button => {
    button.addEventListener("click", () => {
      portfolio.querySelector(".stylo-filter.is-active")?.classList.remove("is-active");
      button.classList.add("is-active");
      state.filter = button.dataset.filter;
      applyFilters();
    });
  });

  document.querySelector("#stylo-clear").addEventListener("click", () => {
    state.filter = "todos";
    portfolio.querySelector(".stylo-filter.is-active")?.classList.remove("is-active");
    portfolio.querySelector('[data-filter="todos"]').classList.add("is-active");
    applyFilters();
  });

  document.querySelectorAll("[data-open-stylo-quote]").forEach(button => button.addEventListener("click", openQuote));
  document.querySelectorAll("[data-close-stylo-quote]").forEach(button => button.addEventListener("click", closeQuote));
  backdrop.addEventListener("click", closeQuote);

  selectedList.addEventListener("click", event => {
    const button = event.target.closest("[data-remove]");
    if (button) toggleSelection(button.dataset.remove);
  });

  document.querySelector(".stylo-modal-close").addEventListener("click", () => modal.close());
  modal.addEventListener("click", event => {
    if (event.target === modal) modal.close();
  });

  document.querySelector("#stylo-modal-add").addEventListener("click", () => {
    if (state.activeWork) toggleSelection(state.activeWork.id);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && drawer.classList.contains("is-open")) closeQuote();
  });

  document.querySelector("#stylo-quote-form").addEventListener("submit", async event => {
    event.preventDefault();

    const form = new FormData(event.currentTarget);
    const selectedWorks = works.filter(work => state.selected.has(work.id));
    const references = selectedWorks.length
      ? selectedWorks.map(work => `• ${work.title}`).join("\n")
      : "• Sin referencia seleccionada";

    const summary = [
      "Solicitud de cotización — Stylo Corporativo",
      "",
      `Nombre: ${form.get("nombre")}`,
      `Empresa: ${form.get("empresa") || "No indicada"}`,
      `Contacto: ${form.get("contacto")}`,
      `Cantidad estimada: ${form.get("cantidad")}`,
      `Estado del logo: ${form.get("logo")}`,
      "",
      "Trabajos de referencia:",
      references,
      "",
      `Detalle: ${form.get("detalle") || "Sin detalle adicional"}`
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

  renderCards();
})();
