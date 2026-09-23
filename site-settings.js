/* ==========================================================================
   Aplica la configuración editable del header y el footer (logo, foto del
   hero, textos, teléfono/correo, redes sociales, copyright) leída desde
   /api/settings. Si la API no responde, deja el contenido real del diseño
   que ya está en el HTML.
   ========================================================================== */

(function () {
  "use strict";

  async function loadSettings() {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        if (data && Object.keys(data).length) return data;
      }
    } catch (e) {}
    return null;
  }

  function setSrc(id, value) {
    if (!value) return;
    const el = document.getElementById(id);
    if (el) el.src = value;
  }

  function setText(id, value) {
    if (!value) return;
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setHtml(id, value) {
    if (!value) return;
    const el = document.getElementById(id);
    if (el) el.innerHTML = value;
  }

  function setHref(id, value) {
    if (!value) return;
    const el = document.getElementById(id);
    if (el) el.href = value;
  }

  async function apply() {
    const s = await loadSettings();
    if (!s) return;

    setSrc("header-logo-image", s.header_logo);
    setSrc("hero-bg-image", s.header_hero_image);
    setText("hero-kicker-text", s.header_hero_kicker);
    setHtml("hero-title-text", s.header_hero_title);
    if (s.header_hero_placeholder) {
      const input = document.getElementById("hero-search-input");
      if (input) { input.placeholder = s.header_hero_placeholder; input.setAttribute("aria-label", s.header_hero_placeholder); }
    }
    setText("hero-search-btn", s.header_hero_button);

    setSrc("footer-logo-image", s.footer_logo);
    setText("footer-phone", s.footer_phone);
    setText("footer-email", s.footer_email);
    setHref("footer-social-facebook", s.footer_social_facebook);
    setHref("footer-social-instagram", s.footer_social_instagram);
    setHref("footer-social-linkedin", s.footer_social_linkedin);
    setHref("footer-social-twitter", s.footer_social_twitter);
    setHref("footer-social-pinterest", s.footer_social_pinterest);
    setText("footer-copyright-text", s.footer_copyright);
  }

  apply();
})();
