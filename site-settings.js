/* ==========================================================================
   Aplica TODOS los textos editables del sitio (header, menú, servicios,
   catálogo, proceso de pedido, portafolio, reseñas, formularios, footer,
   panel de cotización) leídos desde /api/settings. Si la API no responde,
   deja el contenido real del diseño que ya está en el HTML.
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

  function setPlaceholder(id, value) {
    if (!value) return;
    const el = document.getElementById(id);
    if (el) el.placeholder = value;
  }

  async function apply() {
    const s = await loadSettings();
    if (!s) return;

    // Header / hero
    setSrc("header-logo-image", s.header_logo);
    setSrc("hero-bg-image", s.header_hero_image);
    setText("hero-kicker-text", s.header_hero_kicker);
    setHtml("hero-title-text", s.header_hero_title);
    if (s.header_hero_placeholder) {
      const input = document.getElementById("hero-search-input");
      if (input) { input.placeholder = s.header_hero_placeholder; input.setAttribute("aria-label", s.header_hero_placeholder); }
    }
    setText("hero-search-btn", s.header_hero_button);

    // Menú
    setText("nav-inicio-text", s.nav_inicio);
    setText("nav-servicios-text", s.nav_servicios);
    setText("nav-catalogo-text", s.nav_catalogo);
    setText("nav-clientes-text", s.nav_clientes);
    setText("nav-galeria-text", s.nav_galeria);
    setText("nav-cotizar-text", s.nav_cotizar);

    // Servicios / intro
    setText("intro-kicker-text", s.intro_kicker);
    setText("intro-title-text", s.intro_title);
    setText("intro-desc1-text", s.intro_desc1);
    setText("intro-desc2-text", s.intro_desc2);
    setText("stat1-label-text", s.stat1_label);
    setText("stat2-label-text", s.stat2_label);
    setText("stat3-label-text", s.stat3_label);

    // Catálogo
    setText("catalogo-title-text", s.catalogo_title);

    // Proceso de pedido (CTA)
    setText("cta-kicker-text", s.cta_kicker);
    setText("cta-title-text", s.cta_title);
    setText("cta-button-text", s.cta_button);
    setText("cta-step1-title-text", s.cta_step1_title);
    setText("cta-step1-desc-text", s.cta_step1_desc);
    setText("cta-step2-title-text", s.cta_step2_title);
    setText("cta-step2-desc-text", s.cta_step2_desc);
    setText("cta-step3-title-text", s.cta_step3_title);
    setText("cta-step3-desc-text", s.cta_step3_desc);

    // Portafolio
    setText("portfolio-toggle-eyebrow-text", s.portfolio_toggle_eyebrow);
    setText("portfolio-toggle-text", s.portfolio_toggle_text);
    setText("portfolio-heading-eyebrow-text", s.portfolio_heading_eyebrow);
    setHtml("portfolio-heading-title-text", s.portfolio_heading_title);
    setText("portfolio-heading-desc-text", s.portfolio_heading_desc);
    setText("portfolio-filter-todos-text", s.portfolio_filter_todos);
    setText("portfolio-filter-bordado-text", s.portfolio_filter_bordado);
    setText("portfolio-filter-vestuario-text", s.portfolio_filter_vestuario);
    setText("portfolio-filter-drinkware-text", s.portfolio_filter_drinkware);
    setText("portfolio-filter-merchandising-text", s.portfolio_filter_merchandising);
    setText("portfolio-empty-text-text", s.portfolio_empty_text);
    setText("stylo-clear", s.portfolio_empty_button);
    setText("stylo-modal-add", s.portfolio_modal_cta);

    // Reseñas
    setText("resenas-kicker-text", s.resenas_kicker);
    setText("resenas-title-text", s.resenas_title);
    setText("resenas-desc-text", s.resenas_desc);
    setText("resenas-button-text", s.resenas_button);

    // Modal de cotización rápida (botón "Contáctanos")
    setText("contact-modal-title-text", s.contact_modal_title);
    setText("contact-modal-desc-text", s.contact_modal_desc);

    // Contacto
    setText("contacto-title-text", s.contacto_title);
    setText("contacto-desc-text", s.contacto_desc);
    setPlaceholder("contacto-form-nombre", s.contacto_form_nombre);
    setPlaceholder("contacto-form-apellido", s.contacto_form_apellido);
    setPlaceholder("contacto-form-email", s.contacto_form_email);
    setPlaceholder("contacto-form-empresa", s.contacto_form_empresa);
    setPlaceholder("contacto-form-telefono", s.contacto_form_telefono);
    setPlaceholder("contacto-form-mensaje", s.contacto_form_mensaje);
    setText("contacto-attach-label-text", s.contacto_attach_label);
    setText("contacto-submit-button-text", s.contacto_submit_button);

    // Footer
    setSrc("footer-logo-image", s.footer_logo);
    setText("footer-phone", s.footer_phone);
    setText("footer-email", s.footer_email);
    setHref("footer-social-facebook", s.footer_social_facebook);
    setHref("footer-social-instagram", s.footer_social_instagram);
    setHref("footer-social-linkedin", s.footer_social_linkedin);
    setHref("footer-social-twitter", s.footer_social_twitter);
    setHref("footer-social-pinterest", s.footer_social_pinterest);
    setText("footer-copyright-text", s.footer_copyright);
    setText("footer-col1-heading-text", s.footer_col1_heading);
    setText("footer-col1-link1-text", s.footer_col1_link1);
    setText("footer-col1-link2-text", s.footer_col1_link2);
    setText("footer-col1-link3-text", s.footer_col1_link3);
    setText("footer-col1-link4-text", s.footer_col1_link4);
    setText("footer-col2-heading-text", s.footer_col2_heading);
    setText("footer-col2-link1-text", s.footer_col2_link1);
    setText("footer-col2-link2-text", s.footer_col2_link2);
    setText("footer-col3-heading-text", s.footer_col3_heading);
    setText("footer-col3-link1-text", s.footer_col3_link1);
    setText("footer-col3-link2-text", s.footer_col3_link2);
    setText("footer-col3-link3-text", s.footer_col3_link3);

    // Panel de cotización (carrito del catálogo)
    setText("quote-fab-text", s.quote_fab_text);
    setText("quote-drawer-eyebrow-text", s.quote_drawer_eyebrow);
    setText("quote-drawer-title", s.quote_drawer_title);
    setText("quote-drawer-empty-text", s.quote_drawer_empty);
    setText("quote-drawer-submit-text", s.quote_drawer_submit);
    setText("quote-drawer-note-text", s.quote_drawer_note);
  }

  apply();
})();
