/* ==========================================================================
   Editor de reseñas (sección "Lo que Dicen Nuestros Clientes")
   Permite al dueño del sitio agregar, editar y eliminar testimonios de
   clientes sin tocar código. Los datos se guardan en localStorage.
   ========================================================================== */

(function () {
  "use strict";

  var UI = window.StyloEditorUI;
  var STORAGE_KEY = "stylo_resenas_v1";

  var DEFAULT_REVIEWS = [
    {
      id: "r1",
      quote: "El trabajo de Stylo Corporativo me pareció realmente excelente. Desataco su atención amable y personalizada, y la calidad de las poleras y gorros. Un muy buen trabajo. La recomiendo 100%.",
      name: "Revivir",
      place: "Santiago, Chile",
      stars: 5
    }
  ];

  function cloneDefaults() {
    return DEFAULT_REVIEWS.map(function (r) {
      return { id: r.id, quote: r.quote, name: r.name, place: r.place, stars: r.stars };
    });
  }

  var list = document.getElementById("reviews-list");
  var editToggleBtn = document.getElementById("reviews-edit-toggle");
  var addBtnWrapper = document.getElementById("reviews-add-wrapper");
  var editBar = document.getElementById("reviews-edit-bar");

  if (!list) return;

  var editMode = false;
  var reviews = loadReviews();

  function loadReviews() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) {}
    return cloneDefaults();
  }

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

  function starsMarkup(count, editable) {
    var wrap = document.createElement("div");
    wrap.className = "review-card__stars";
    for (var i = 1; i <= 5; i++) {
      var star = document.createElement("img");
      star.src = "assets/icons/star.svg";
      star.alt = "";
      star.className = i <= count ? "" : "is-off";
      if (editable) {
        star.classList.add("is-clickable");
        (function (value) {
          star.addEventListener("click", function () {
            wrap.dataset.value = value;
            wrap.querySelectorAll("img").forEach(function (el, idx) {
              el.classList.toggle("is-off", idx >= value);
            });
          });
        })(i);
      }
      wrap.appendChild(star);
    }
    wrap.dataset.value = count;
    return wrap;
  }

  function render() {
    list.innerHTML = "";
    reviews.forEach(function (review) {
      list.appendChild(buildCard(review));
    });
    if (addBtnWrapper) addBtnWrapper.style.display = editMode ? "flex" : "none";
  }

  function buildCard(review) {
    var card = document.createElement("div");
    card.className = "review-card";
    card.dataset.id = review.id;

    var quote = document.createElement("p");
    quote.className = "review-card__quote";
    quote.textContent = review.quote;

    var footer = document.createElement("div");
    footer.className = "review-card__footer";

    var who = document.createElement("div");
    var name = document.createElement("p");
    name.className = "review-card__name";
    name.textContent = review.name;
    var place = document.createElement("p");
    place.className = "review-card__place";
    place.textContent = review.place;
    who.appendChild(name);
    who.appendChild(place);

    var stars = starsMarkup(review.stars, editMode);

    footer.appendChild(who);
    footer.appendChild(stars);

    card.appendChild(quote);
    card.appendChild(footer);

    if (editMode) {
      card.classList.add("is-editing");

      quote.contentEditable = "true";
      quote.classList.add("is-editable");
      quote.addEventListener("blur", function () {
        review.quote = quote.textContent.trim() || review.quote;
        quote.textContent = review.quote;
        saveReviews();
      });

      name.contentEditable = "true";
      name.classList.add("is-editable");
      name.addEventListener("blur", function () {
        review.name = name.textContent.trim() || review.name;
        name.textContent = review.name;
        saveReviews();
      });

      place.contentEditable = "true";
      place.classList.add("is-editable");
      place.addEventListener("blur", function () {
        review.place = place.textContent.trim() || review.place;
        place.textContent = place.textContent.trim() || review.place;
        saveReviews();
      });

      stars.addEventListener("click", function () {
        review.stars = parseInt(stars.dataset.value, 10);
        saveReviews();
      });

      var deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "review-card__delete-btn";
      deleteBtn.textContent = "Eliminar reseña";
      deleteBtn.addEventListener("click", function () {
        UI.askConfirm('¿Eliminar la reseña de "' + review.name + '"?', function () {
          reviews = reviews.filter(function (r) { return r.id !== review.id; });
          saveReviews();
          render();
          UI.showToast("Reseña eliminada.");
        });
      });
      card.appendChild(deleteBtn);
    }

    return card;
  }

  function addReview() {
    reviews.push({
      id: uid(),
      quote: "Escribe aquí la nueva reseña del cliente.",
      name: "Nombre del cliente",
      place: "Ciudad, país",
      stars: 5
    });
    saveReviews();
    render();
    UI.showToast("Reseña agregada. Edita su contenido.");
  }

  function setEditMode(on) {
    editMode = on;
    if (editBar) editBar.style.display = editMode ? "flex" : "none";
    if (editToggleBtn) {
      editToggleBtn.textContent = editMode ? "Salir de edición" : "Editar reseñas";
    }
    render();
  }

  function toggleEdit() {
    if (editMode) { setEditMode(false); return; }
    UI.unlockAndRun(
      "Editar reseñas",
      "Ingresa la clave de edición para agregar o cambiar testimonios.",
      function () { setEditMode(true); }
    );
  }

  if (editToggleBtn) editToggleBtn.addEventListener("click", toggleEdit);

  var addBtn = document.getElementById("reviews-add-btn");
  if (addBtn) addBtn.addEventListener("click", addReview);

  var resetBtn = document.getElementById("reviews-reset-btn");
  if (resetBtn) {
    resetBtn.addEventListener("click", function () {
      UI.askConfirm("¿Restablecer las reseñas al diseño original? Se perderán tus cambios.", function () {
        reviews = cloneDefaults();
        saveReviews();
        render();
        UI.showToast("Reseñas restablecidas.");
      });
    });
  }

  render();
})();
