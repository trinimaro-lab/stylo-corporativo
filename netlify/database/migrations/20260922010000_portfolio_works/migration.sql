-- Portafolio (sección "Ver trabajos realizados")

CREATE TABLE IF NOT EXISTS portfolio_works (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  label TEXT NOT NULL,
  image TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO portfolio_works (id, title, category, label, image, description, sort_order) VALUES
  ('01', 'Bordado institucional', 'bordado', 'Bordado', 'assets/portfolio/images/01.webp', 'Detalle de bordado aplicado sobre prenda, con lectura clara y terminación precisa.', 1),
  ('02', 'Producción para evento', 'bordado', 'Bordado', 'assets/portfolio/images/02.webp', 'Preparación coordinada de piezas personalizadas para una experiencia corporativa.', 2),
  ('03', 'Jockey corporativo', 'bordado', 'Bordado', 'assets/portfolio/images/03.webp', 'Logotipo multicolor bordado en jockey de visera plana.', 3),
  ('04', 'Polera piqué bordada', 'vestuario', 'Vestuario', 'assets/portfolio/images/04.webp', 'Polera corporativa oscura con bordado compacto de marca.', 4),
  ('05', 'Polera gráfica Chile', 'vestuario', 'Vestuario', 'assets/portfolio/images/05.webp', 'Aplicación gráfica de gran formato sobre polera blanca.', 5),
  ('06', 'Polera personalizada', 'vestuario', 'Vestuario', 'assets/portfolio/images/06.webp', 'Diseño de personajes y gráfica personalizada sobre textil de color.', 6),
  ('07', 'Activación de marca', 'merchandising', 'Merchandising', 'assets/portfolio/images/07.webp', 'Línea coordinada de botellas, vasos y textiles para una activación.', 7),
  ('08', 'Termo personalizado', 'drinkware', 'Vasos y tazones', 'assets/portfolio/images/08.webp', 'Personalización envolvente aplicada sobre termo para regalo o evento.', 8),
  ('09', 'Polera temática', 'vestuario', 'Vestuario', 'assets/portfolio/images/09.webp', 'Estampado de temporada aplicado en una prenda de alto impacto visual.', 9),
  ('10', 'Tazones estampados', 'drinkware', 'Vasos y tazones', 'assets/portfolio/images/10.webp', 'Colección de tazones con fotografías e ilustraciones personalizadas.', 10),
  ('11', 'Colección promocional', 'merchandising', 'Merchandising', 'assets/portfolio/images/11.webp', 'Selección de objetos personalizados para regalos y venta especial.', 11),
  ('13', 'Pack para celebración', 'merchandising', 'Merchandising', 'assets/portfolio/images/13.webp', 'Mix de tazones y poleras preparado para una fecha especial.', 12),
  ('14', 'Línea de vasos', 'drinkware', 'Vasos y tazones', 'assets/portfolio/images/14.webp', 'Producción variada de vasos personalizados, lista para exhibición.', 13),
  ('15', 'Tote bag personalizada', 'merchandising', 'Merchandising', 'assets/portfolio/images/15.webp', 'Bolso textil con aplicación gráfica, pensado como recuerdo o regalo.', 14),
  ('16', 'Merchandising de celebración', 'merchandising', 'Merchandising', 'assets/portfolio/images/16.webp', 'Piezas coordinadas para celebración, recuerdo y experiencia de marca.', 15),
  ('17', 'Vasos personalizados', 'drinkware', 'Vasos y tazones', 'assets/portfolio/images/17.webp', 'Vasos con identidad gráfica consistente para evento o regalo.', 16),
  ('18', 'Producción de cristalería', 'drinkware', 'Vasos y tazones', 'assets/portfolio/images/18.webp', 'Producción amplia de vasos personalizados con múltiples diseños.', 17),
  ('19', 'Bordado de personaje', 'bordado', 'Bordado', 'assets/portfolio/images/19.webp', 'Bordado multicolor de personaje con definición en detalles pequeños.', 18),
  ('20', 'Bordado sobre polera', 'bordado', 'Bordado', 'assets/portfolio/images/20.webp', 'Aplicación bordada de alta presencia sobre una prenda oscura.', 19)
ON CONFLICT (id) DO NOTHING;
