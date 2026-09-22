-- Foto del producto/trabajo recibido, distinta de la foto de perfil del
-- cliente (columna "photo"). Se puede subir desde la encuesta pública o
-- desde el panel de administración.

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS product_photo TEXT NOT NULL DEFAULT '';
