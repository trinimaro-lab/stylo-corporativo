/* ==========================================================================
   Sección "Marcas que confían en nosotros" — lee título, descripción, foto
   colage (/api/brands) y el grid de logos (/api/brand-logos) desde la base
   de datos. Si la API no responde, usa el contenido real del diseño.
   ========================================================================== */

(function () {
  "use strict";

  const DEFAULT_SECTION = {
    title: "Marcas que confían en nosotros",
    description: "Stylo Corporativo se enorgullece de entregar productos textiles de primer nivel y confección técnica de excelencia, asegurando una calidad inigualable y profesionalismo para cada cliente. Ya sea que represente a un pequeño emprendimiento o a una gran corporación, nuestras soluciones versátiles y personalizadas están diseñadas para satisfacer las necesidades de negocios en todos los sectores e industrias.",
    collageImage: "assets/brands/brands-collage.png"
  };

  const DEFAULT_LOGOS = [
    { id: "b1", image: "assets/brands/brand-1.png", alt: "Marca cliente 1" },
    { id: "b2", image: "assets/brands/brand-2.png", alt: "Marca cliente 2" },
    { id: "b3", image: "assets/brands/brand-3.png", alt: "Marca cliente 3" },
    { id: "b4", image: "assets/brands/brand-4.png", alt: "Marca cliente 4" },
    { id: "b5", image: "assets/brands/brand-5.png", alt: "Marca cliente 5" },
    { id: "b6", image: "assets/brands/brand-6.png", alt: "Marca cliente 6" },
    { id: "b7", image: "assets/brands/brand-7.png", alt: "Marca cliente 7" },
    { id: "b8", image: "assets/brands/brand-8.png", alt: "Marca cliente 8" },
    { id: "b9", image: "assets/brands/brand-9.png", alt: "Marca cliente 9" }
  ];

  const section = document.querySelector(".marcas");
  if (!section) return;

  const titleEl = section.querySelector(".marcas__title");
  const descEl = section.querySelector(".marcas__desc");
  const collageImg = section.querySelector(".marcas__image img");
  const logosWrap = section.querySelector(".marcas__logos");

  async function loadSection() {
    try {
      const res = await fetch("/api/brands");
      if (res.ok) {
        const data = await res.json();
        if (data && data.title) return data;
      }
    } catch (e) {}
    return DEFAULT_SECTION;
  }

  async function loadLogos() {
    try {
      const res = await fetch("/api/brand-logos");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length) return data;
      }
    } catch (e) {}
    return DEFAULT_LOGOS;
  }

  async function render() {
    const [data, logos] = await Promise.all([loadSection(), loadLogos()]);

    if (titleEl) titleEl.textContent = data.title;
    if (descEl) descEl.textContent = data.description;
    if (collageImg) collageImg.src = data.collageImage;

    if (logosWrap) {
      logosWrap.innerHTML = "";
      logos.forEach(logo => {
        const img = document.createElement("img");
        img.src = logo.image;
        img.alt = logo.alt || "Marca cliente";
        img.loading = "lazy";
        logosWrap.appendChild(img);
      });
    }
  }

  render();
})();
