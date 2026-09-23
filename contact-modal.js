/* ==========================================================================
   Formulario rápido de cotización — se abre desde el botón "Contáctanos"
   del hero. Arma un resumen de la solicitud y lo comparte (o lo copia al
   portapapeles) igual que el carrito de cotización del catálogo, ya que
   el sitio no tiene envío de correo propio.
   ========================================================================== */

(function () {
  "use strict";

  const heroBtn = document.getElementById("hero-search-btn");
  const modal = document.getElementById("contact-modal");
  const closeBtn = document.getElementById("contact-modal-close");
  const form = document.getElementById("contact-modal-form");
  if (!heroBtn || !modal || !form) return;

  const productoSelect = document.getElementById("contact-modal-producto");
  const productoOtroWrap = document.getElementById("contact-modal-producto-otro-wrap");
  const productoOtroInput = document.getElementById("contact-modal-producto-otro");

  const tecnicaSelect = document.getElementById("contact-modal-tecnica");
  const tecnicaOtroWrap = document.getElementById("contact-modal-tecnica-otro-wrap");
  const tecnicaOtroInput = document.getElementById("contact-modal-tecnica-otro");

  function toggleOtro(select, wrap, input) {
    const isOtro = select.value === "Otro";
    wrap.hidden = !isOtro;
    input.required = isOtro;
    if (!isOtro) input.value = "";
  }

  productoSelect.addEventListener("change", () => toggleOtro(productoSelect, productoOtroWrap, productoOtroInput));
  tecnicaSelect.addEventListener("change", () => toggleOtro(tecnicaSelect, tecnicaOtroWrap, tecnicaOtroInput));

  heroBtn.addEventListener("click", () => {
    modal.showModal();
  });

  closeBtn.addEventListener("click", () => modal.close());
  modal.addEventListener("click", event => {
    if (event.target === modal) modal.close();
  });

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

  form.addEventListener("submit", async event => {
    event.preventDefault();

    const data = new FormData(form);
    const producto = data.get("producto") === "Otro" ? (data.get("producto_otro") || "Otro") : data.get("producto");
    const tecnica = data.get("tecnica") === "Otro" ? (data.get("tecnica_otro") || "Otro") : data.get("tecnica");

    const summary = [
      "Solicitud de cotización — Stylo Corporativo",
      "",
      `Nombre: ${data.get("nombre")}`,
      `Teléfono: ${data.get("telefono")}`,
      `Empresa: ${data.get("empresa") || "No indicada"}`,
      `Correo: ${data.get("correo")}`,
      "",
      `Qué quiere cotizar: ${producto}`,
      `Técnica: ${tecnica}`,
      `Cantidad: ${data.get("cantidad") || "No indicada"}`
    ].join("\n");

    if (navigator.share) {
      try {
        await navigator.share({ title: "Solicitud de cotización — Stylo Corporativo", text: summary });
        showToast("Solicitud lista para compartir");
        finish();
        return;
      } catch (error) {
        if (error.name === "AbortError") return; // el usuario cerró la hoja de compartir, deja el modal abierto
        // si share falla por otra razón, sigue abajo e intenta copiar al portapapeles
      }
    }

    try {
      await navigator.clipboard.writeText(summary);
      showToast("Solicitud copiada para enviarla por correo o WhatsApp");
    } catch (error) {
      showToast("No se pudo copiar automáticamente. Copia el detalle manualmente.");
    }
    finish();

    function finish() {
      form.reset();
      toggleOtro(productoSelect, productoOtroWrap, productoOtroInput);
      toggleOtro(tecnicaSelect, tecnicaOtroWrap, tecnicaOtroInput);
      modal.close();
    }
  });
})();
