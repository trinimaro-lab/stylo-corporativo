/* ==========================================================================
   Editor de catálogo — panel de administración (admin.html)
   Lee y guarda en /api/products (base de datos), visible para todos los
   visitantes del sitio apenas se guarda un cambio.
   ========================================================================== */

(function () {
  "use strict";

  const UI = window.StyloEditorUI;

  const grid = document.getElementById("product-grid");
  const editToggleBtn = document.getElementById("catalog-edit-toggle");
  const addBtnWrapper = document.getElementById("catalog-add-wrapper");
  const editBar = document.getElementById("catalog-edit-bar");

  if (!grid) return;

  var editMode = false;
  var products = [];

  async function api(method, body) {
    const res = await UI.authFetch("/api/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) throw new Error("request failed: " + res.status);
    return res.json();
  }

  async function loadProducts() {
    const res = await fetch("/api/products");
    products = res.ok ? await res.json() : [];
    render();
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
        reader.onload = async function () {
          product.image = reader.result;
          img.src = product.image;
          try {
            await api("POST", { id: product.id, title: product.title, image: product.image });
            UI.showToast("Imagen actualizada.");
          } catch (e) {
            UI.showToast("No se pudo guardar la imagen.");
          }
        };
        reader.readAsDataURL(file);
      });
      uploadLabel.appendChild(fileInput);

      var deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "product-card__delete-btn";
      deleteBtn.textContent = "Eliminar";
      deleteBtn.addEventListener("click", function () {
        UI.askConfirm('¿Eliminar "' + product.title + '" del catálogo?', async function () {
          try {
            await api("DELETE", { id: product.id });
            products = products.filter(function (p) { return p.id !== product.id; });
            render();
            UI.showToast("Producto eliminado.");
          } catch (e) {
            UI.showToast("No se pudo eliminar.");
          }
        });
      });

      overlay.appendChild(uploadLabel);
      overlay.appendChild(deleteBtn);
      media.appendChild(overlay);

      caption.contentEditable = "true";
      caption.classList.add("is-editable");
      caption.addEventListener("blur", async function () {
        product.title = caption.textContent.trim() || product.title;
        caption.textContent = product.title;
        img.alt = product.title;
        try {
          await api("POST", { id: product.id, title: product.title, image: product.image });
        } catch (e) {
          UI.showToast("No se pudo guardar el título.");
        }
      });
      caption.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter") { ev.preventDefault(); caption.blur(); }
      });
    }

    return card;
  }

  async function addProduct() {
    var product = { id: uid(), title: "Nuevo producto", image: "assets/products/bordado-corporativo.png" };
    try {
      await api("POST", product);
      products.push(product);
      render();
      UI.showToast("Producto agregado. Cambia su foto y título.");
    } catch (e) {
      UI.showToast("No se pudo agregar el producto.");
    }
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
  if (resetBtn) resetBtn.style.display = "none"; // el "original" ahora vive en la base de datos

  loadProducts();
})();
