/* ==========================================================================
   Editor de catálogo (sección "Nuestro Trabajo")
   Permite al dueño del sitio subir/cambiar imágenes y títulos de los
   productos sin tocar código. Los datos se guardan en localStorage, por lo
   que persisten en el navegador usado para editar.
   ========================================================================== */

(function () {
  "use strict";

  var UI = window.StyloEditorUI;
  var STORAGE_KEY = "stylo_catalogo_v1";

  var DEFAULT_PRODUCTS = [
    { id: "p1", title: "Bordado corporativo", image: "assets/products/bordado-corporativo.png" },
    { id: "p2", title: "Estampado (DTF/serigrafía)", image: "assets/products/estampado-dtf-serigrafia.png" },
    { id: "p3", title: "Sublimación", image: "assets/products/sublimacion.png" },
    { id: "p4", title: "Merchandising promocional", image: "assets/products/merchandising-promocional.png" },
    { id: "p5", title: "Regalos y eventos personalizados", image: "assets/products/regalos-eventos-personalizados.png" },
    { id: "p6", title: "Merchandising deportivo / fanaticada", image: "assets/products/merchandising-deportivo-fanaticada.png" },
    { id: "p7", title: "Confección y uniformes corporativos", image: "assets/products/confeccion-uniformes-corporativos.png" }
  ];

  function cloneDefaults() {
    return DEFAULT_PRODUCTS.map(function (p) {
      return { id: p.id, title: p.title, image: p.image };
    });
  }

  var grid = document.getElementById("product-grid");
  var editToggleBtn = document.getElementById("catalog-edit-toggle");
  var addBtnWrapper = document.getElementById("catalog-add-wrapper");
  var editBar = document.getElementById("catalog-edit-bar");

  if (!grid) return;

  var editMode = false;
  var products = loadProducts();

  function loadProducts() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) {}
    return cloneDefaults();
  }

  function saveProducts() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      UI.showToast("No se pudo guardar (almacenamiento local lleno o bloqueado).");
    }
  }

  function uid() {
    return "p" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function render() {
    grid.innerHTML = "";
    products.forEach(function (product) {
      grid.appendChild(buildCard(product));
    });
    if (addBtnWrapper) addBtnWrapper.style.display = editMode ? "flex" : "none";
  }

  function buildCard(product) {
    var card = document.createElement("article");
    card.className = "product-card";
    card.dataset.id = product.id;

    var media = document.createElement("div");
    media.className = "product-card__media";

    var img = document.createElement("img");
    img.src = product.image;
    img.alt = product.title;
    img.loading = "lazy";
    media.appendChild(img);

    var caption = document.createElement("p");
    caption.className = "product-card__caption";
    caption.textContent = product.title;
    caption.contentEditable = "false";

    card.appendChild(media);
    card.appendChild(caption);

    if (editMode) {
      card.classList.add("is-editing");

      var overlay = document.createElement("div");
      overlay.className = "product-card__edit-overlay";

      var uploadLabel = document.createElement("label");
      uploadLabel.className = "product-card__upload-btn";
      uploadLabel.textContent = "Cambiar imagen";
      var fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";
      fileInput.className = "visually-hidden";
      fileInput.addEventListener("change", function (ev) {
        var file = ev.target.files && ev.target.files[0];
        if (!file) return;
        var reader = new FileReader();
        reader.onload = function () {
          product.image = reader.result;
          img.src = product.image;
          saveProducts();
          UI.showToast("Imagen actualizada.");
        };
        reader.readAsDataURL(file);
      });
      uploadLabel.appendChild(fileInput);

      var deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "product-card__delete-btn";
      deleteBtn.textContent = "Eliminar";
      deleteBtn.addEventListener("click", function () {
        UI.askConfirm('¿Eliminar "' + product.title + '" del catálogo?', function () {
          products = products.filter(function (p) { return p.id !== product.id; });
          saveProducts();
          render();
          UI.showToast("Producto eliminado.");
        });
      });

      overlay.appendChild(uploadLabel);
      overlay.appendChild(deleteBtn);
      media.appendChild(overlay);

      caption.contentEditable = "true";
      caption.classList.add("is-editable");
      caption.addEventListener("blur", function () {
        product.title = caption.textContent.trim() || product.title;
        caption.textContent = product.title;
        img.alt = product.title;
        saveProducts();
      });
      caption.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter") { ev.preventDefault(); caption.blur(); }
      });
    }

    return card;
  }

  function addProduct() {
    products.push({ id: uid(), title: "Nuevo producto", image: "assets/products/bordado-corporativo.png" });
    saveProducts();
    render();
    UI.showToast("Producto agregado. Cambia su foto y título.");
  }

  function setEditMode(on) {
    editMode = on;
    document.body.classList.toggle("catalog-editing", editMode);
    if (editBar) editBar.style.display = editMode ? "flex" : "none";
    if (editToggleBtn) {
      editToggleBtn.textContent = editMode ? "Salir de edición" : "Editar catálogo";
    }
    render();
  }

  function toggleEdit() {
    if (editMode) { setEditMode(false); return; }
    UI.unlockAndRun(
      "Editar catálogo",
      "Ingresa la clave de edición para subir o cambiar productos.",
      function () { setEditMode(true); }
    );
  }

  if (editToggleBtn) editToggleBtn.addEventListener("click", toggleEdit);

  var addBtn = document.getElementById("catalog-add-btn");
  if (addBtn) addBtn.addEventListener("click", addProduct);

  var resetBtn = document.getElementById("catalog-reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      UI.askConfirm("¿Restablecer el catálogo al diseño original? Se perderán tus cambios.", function () {
        products = cloneDefaults();
        saveProducts();
        render();
        UI.showToast("Catálogo restablecido.");
      });
    });
  }

  render();
})();
