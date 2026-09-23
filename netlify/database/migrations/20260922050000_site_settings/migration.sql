-- Configuración simple (clave/valor) para el header y el footer del sitio:
-- logo, foto del hero, textos del hero, teléfono/correo, redes sociales y
-- el texto de copyright.

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO site_settings (key, value) VALUES
  ('header_logo', 'assets/logo-white.png'),
  ('header_hero_image', 'assets/hero-bg.jpg'),
  ('header_hero_kicker', 'Tu marca habla desde la primera mirada.'),
  ('header_hero_title', '¡Potencia tu imagen corporativa<br>con bordados de excelencia!'),
  ('header_hero_placeholder', 'Necesitas algo especial?'),
  ('header_hero_button', 'Contáctanos'),
  ('footer_logo', 'assets/footer-logo.png'),
  ('footer_phone', '[Teléfono]'),
  ('footer_email', '[Correo]'),
  ('footer_social_facebook', '#'),
  ('footer_social_instagram', '#'),
  ('footer_social_linkedin', '#'),
  ('footer_social_twitter', '#'),
  ('footer_social_pinterest', '#'),
  ('footer_copyright', '© 2026 Stylo Corporativo. Todos los derechos reservados.')
ON CONFLICT (key) DO NOTHING;
