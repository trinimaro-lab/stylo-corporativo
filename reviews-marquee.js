/* ==========================================================================
   Carrusel de reseñas ("Lo que Dicen Nuestros Clientes")
   Lee las reseñas desde localStorage (mismo formato que usa el editor de
   reseñas) y las muestra en una fila que se desplaza sola, pausándose al
   pasar el mouse. Sin reseñas guardadas, usa la reseña real del diseño.
   ========================================================================== */

(function () {
  "use strict";

  const STORAGE_KEY = "stylo_resenas_v2";

  const DEFAULT_REVIEWS = [
    {
      id: "r1",
      name: "Revivir",
      company: "",
      review: "El trabajo de Stylo Corporativo me pareció realmente excelente. Desataco su atención amable y personalizada, y la calidad de las poleras y gorros. Un muy buen trabajo. La recomiendo 100%.",
      photo: ""
    }
  ];

  const track = document.getElementById("reviews-marquee-track");
  const marquee = document.getElementById("reviews-marquee");
  if (!track || !marquee) return;

  function loadReviews() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length) return parsed;
      }
    } catch (e) {}
    return DEFAULT_REVIEWS;
  }

  function initials(name) {
    return (name || "?").trim().charAt(0).toUpperCase();
  }

  function buildCard(review) {
    const card = document.createElement("article");
    card.className = "testimonial-card";

    const head = document.createElement("div");
    head.className = "testimonial-card__head";

    if (review.photo) {
      const img = document.createElement("img");
      img.className = "testimonial-card__avatar";
      img.src = review.photo;
      img.alt = review.name;
      head.appendChild(img);
    } else {
      const initialsAvatar = document.createElement("div");
      initialsAvatar.className = "testimonial-card__avatar testimonial-card__avatar--initials";
      initialsAvatar.textContent = initials(review.name);
      head.appendChild(initialsAvatar);
    }

    const who = document.createElement("div");
    const name = document.createElement("p");
    name.className = "testimonial-card__name";
    name.textContent = review.name;
    who.appendChild(name);

    if (review.company) {
      const company = document.createElement("p");
      company.className = "testimonial-card__company";
      company.textContent = review.company;
      who.appendChild(company);
    }

    head.appendChild(who);

    const quote = document.createElement("p");
    quote.className = "testimonial-card__quote";
    quote.textContent = review.review;

    card.appendChild(head);
    card.appendChild(quote);
    return card;
  }

  function render() {
    const reviews = loadReviews();
    track.innerHTML = "";

    // Se duplica la lista para que el desplazamiento sea continuo (sin salto).
    reviews.concat(reviews).forEach(review => {
      track.appendChild(buildCard(review));
    });

    marquee.classList.toggle("marquee--single", reviews.length === 1);
  }

  marquee.addEventListener("mouseenter", () => track.classList.add("is-paused"));
  marquee.addEventListener("mouseleave", () => track.classList.remove("is-paused"));

  render();
})();
