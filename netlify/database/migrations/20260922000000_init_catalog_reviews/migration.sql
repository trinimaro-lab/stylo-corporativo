-- Catálogo (sección "Nuestro Trabajo") y reseñas (sección "Lo que Dicen Nuestros Clientes")

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  image TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  review TEXT NOT NULL,
  photo TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO products (id, title, image, sort_order) VALUES
  ('p1', 'Bordado corporativo', 'assets/products/bordado-corporativo.png', 1),
  ('p2', 'Estampado (DTF/serigrafía)', 'assets/products/estampado-dtf-serigrafia.png', 2),
  ('p3', 'Sublimación', 'assets/products/sublimacion.png', 3),
  ('p4', 'Merchandising promocional', 'assets/products/merchandising-promocional.png', 4),
  ('p5', 'Regalos y eventos personalizados', 'assets/products/regalos-eventos-personalizados.png', 5),
  ('p6', 'Merchandising deportivo / fanaticada', 'assets/products/merchandising-deportivo-fanaticada.png', 6),
  ('p7', 'Confección y uniformes corporativos', 'assets/products/confeccion-uniformes-corporativos.png', 7)
ON CONFLICT (id) DO NOTHING;

INSERT INTO reviews (id, name, company, review, photo, sort_order) VALUES
  ('r1', 'Revivir', '', 'El trabajo de Stylo Corporativo me pareció realmente excelente. Desataco su atención amable y personalizada, y la calidad de las poleras y gorros. Un muy buen trabajo. La recomiendo 100%.', '', 1)
ON CONFLICT (id) DO NOTHING;
