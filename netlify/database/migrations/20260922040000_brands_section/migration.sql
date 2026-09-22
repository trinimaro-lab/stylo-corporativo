-- Sección "Marcas que confían en nosotros": título/descripción/foto colage
-- (fila única "main") y el grid de logos de clientes.

CREATE TABLE IF NOT EXISTS brand_section (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  collage_image TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS brand_logos (
  id TEXT PRIMARY KEY,
  image TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO brand_section (id, title, description, collage_image) VALUES (
  'main',
  'Marcas que confían en nosotros',
  'Stylo Corporativo se enorgullece de entregar productos textiles de primer nivel y confección técnica de excelencia, asegurando una calidad inigualable y profesionalismo para cada cliente. Ya sea que represente a un pequeño emprendimiento o a una gran corporación, nuestras soluciones versátiles y personalizadas están diseñadas para satisfacer las necesidades de negocios en todos los sectores e industrias.',
  'assets/brands/brands-collage.png'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO brand_logos (id, image, alt, sort_order) VALUES
  ('b1', 'assets/brands/brand-1.png', 'Marca cliente 1', 1),
  ('b2', 'assets/brands/brand-2.png', 'Marca cliente 2', 2),
  ('b3', 'assets/brands/brand-3.png', 'Marca cliente 3', 3),
  ('b4', 'assets/brands/brand-4.png', 'Marca cliente 4', 4),
  ('b5', 'assets/brands/brand-5.png', 'Marca cliente 5', 5),
  ('b6', 'assets/brands/brand-6.png', 'Marca cliente 6', 6),
  ('b7', 'assets/brands/brand-7.png', 'Marca cliente 7', 7),
  ('b8', 'assets/brands/brand-8.png', 'Marca cliente 8', 8),
  ('b9', 'assets/brands/brand-9.png', 'Marca cliente 9', 9)
ON CONFLICT (id) DO NOTHING;
