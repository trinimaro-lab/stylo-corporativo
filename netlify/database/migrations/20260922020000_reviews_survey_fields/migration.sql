-- Encuesta pública de reseñas: calificación, estado de moderación y fecha de envío.
-- Las reseñas creadas desde /api/survey entran como 'pending' y solo se ven en
-- el panel de administración hasta que alguien las aprueba (status='approved');
-- el sitio público (marquee de testimonios) solo muestra las aprobadas.

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rating INTEGER NOT NULL DEFAULT 5;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'approved';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMP NOT NULL DEFAULT NOW();
