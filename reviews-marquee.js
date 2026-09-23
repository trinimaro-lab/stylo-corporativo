/* ==========================================================================
   Carrusel de reseñas ("Lo que Dicen Nuestros Clientes")
   Lee las reseñas desde la API (/api/reviews, respaldada por la base de
   datos) y las muestra en una fila que se desplaza sola, pausándose al
   pasar el mouse. Si la API no responde, usa la reseña real del diseño.

   El texto de cada reseña se recorta a un máximo de caracteres (~4 líneas)
   para que todas las tarjetas queden parejas; si el texto es más largo,
   aparece "Ver más" y se abre un modal al centro con la reseña completa.
   ========================================================================== */

(function () {
  "use strict";

  const MAX_CHARS = 170;

  const DEFAULT_REVIEWS = [
    {
      id: "r1",
      name: "Revivir",
      company: "",
      review: "El trabajo de Stylo Corporativo me pareció realmente excelente. Desataco su atención amable y personalizada, y la calidad de las poleras y gorros. Un muy buen trabajo. La recomiendo 100%.",
      photo: "",
      product_photo: ""
    }
  ];

  const track = document.getElementById("reviews-marquee-track");
  const marquee = document.getElementById("reviews-marquee");
  if (!track || !marquee) return;

  const modal = document.getElementById("review-modal");
  const modalAvatar = document.getElementById("review-modal-avatar");
  const modalName = document.getElementById("review-modal-name");
  const modalCompany = document.getElementById("review-modal-company");
  const modalText = document.getElementById("review-modal-text");
  const modalClose = modal ? modal.querySelector(".review-modal__close") : null;

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

  function truncate(text) {
    if (text.length <= MAX_CHARS) return { text: text, isTruncated: false };
    let sliced = text.slice(0, MAX_CHARS);
    const lastSpace = sliced.lastIndexOf(" ");
    if (lastSpace > 0) sliced = sliced.slice(0, lastSpace);
    return { text: sliced + "…", isTruncated: true };
  }

  function openReviewModal(review) {
    if (!modal) return;

    modalAvatar.innerHTML = "";
    if (review.photo) {
      const img = document.createElement("img");
      img.src = review.photo;
      img.alt = review.name;
      modalAvatar.appendChild(img);
    } else {
      modalAvatar.textContent = initials(review.name);
    }

    modalName.textContent = review.name;
    modalCompany.textContent = review.company || "";
    modalCompany.hidden = !review.company;
    modalText.textContent = review.review;

    modal.showModal();
  }

  if (modalClose) modalClose.addEventListener("click", () => modal.close());
  if (modal) {
    modal.addEventListener("click", event => {
      if (event.target === modal) modal.close();
    });
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

    const { text, isTruncated } = truncate(review.review);

    const quote = document.createElement("p");
    quote.className = "testimonial-card__quote";
    quote.textContent = text;

    card.appendChild(head);
    card.appendChild(quote);

    if (isTruncated) {
      const moreBtn = document.createElement("button");
      moreBtn.type = "button";
      moreBtn.className = "testimonial-card__more";
      moreBtn.textContent = "Ver más";
      moreBtn.addEventListener("click", () => openReviewModal(review));
      card.appendChild(moreBtn);
    }

    if (review.product_photo) {
      const productImg = document.createElement("img");
      productImg.className = "testimonial-card__product-photo";
      productImg.src = review.product_photo;
      productImg.alt = "Producto de " + review.name;
      productImg.loading = "lazy";
      card.appendChild(productImg);
    }

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
