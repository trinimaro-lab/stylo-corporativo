const { getPool, isAuthorized } = require("./_lib/db");

// Título, descripción y foto colage de la sección "Marcas que confían en
// nosotros" (fila única, id fijo "main"). El grid de logos vive en
// /api/brand-logos.
module.exports = async function handler(req, res) {
  const pool = getPool();

  if (req.method === "GET") {
    const { rows } = await pool.query(
      `SELECT title, description, collage_image AS "collageImage"
       FROM brand_section
       WHERE id = 'main'`
    );
    return res.status(200).json(rows[0] ?? null);
  }

  if (!isAuthorized(req)) {
    return res.status(401).send("Unauthorized");
  }

  if (req.method === "POST") {
    const { title, description, collageImage } = req.body || {};
    if (!title) {
      return res.status(400).send("Missing fields");
    }
    await pool.query(
      `INSERT INTO brand_section (id, title, description, collage_image, updated_at)
       VALUES ('main', $1, $2, $3, NOW())
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         collage_image = EXCLUDED.collage_image,
         updated_at = NOW()`,
      [title, description ?? "", collageImage ?? ""]
    );
    return res.status(200).json({ ok: true });
  }

  return res.status(405).send("Method not allowed");
};
