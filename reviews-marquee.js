/* ==========================================================================
   Carrusel de reseñas ("Lo que Dicen Nuestros Clientes")
   Lee las reseñas desde la API (/api/reviews, respaldada por la base de
   datos) y las muestra en una fila que se desplaza sola, pausándose al
   pasar el mouse. Si la API no responde, usa la reseña real del diseño.
   ========================================================================== */

(function () {
  "use strict";

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

  async function loadReviews() {
    try {
      const res = await fetch("/api/reviews");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) return data;
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

  async function render() {
    const reviews = await loadReviews();
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
