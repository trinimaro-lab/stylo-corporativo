const { getPool, isAuthorized } = require("./_lib/db");

module.exports = async function handler(req, res) {
  const pool = getPool();

  if (req.method === "GET") {
    // Público: solo reseñas aprobadas (para el carrusel de testimonios).
    // Con token de admin: todas, incluidas las pendientes de la encuesta.
    const authed = isAuthorized(req);
    const { rows } = authed
      ? await pool.query(
          `SELECT id, name, company, review, photo, product_photo, rating, status, submitted_at
           FROM reviews
           ORDER BY (status = 'pending') DESC, submitted_at DESC`
        )
      : await pool.query(
          `SELECT id, name, company, review, photo, product_photo, rating, status, submitted_at
           FROM reviews
           WHERE status = 'approved'
           ORDER BY sort_order ASC, updated_at ASC`
        );
    return res.status(200).json(rows);
  }

  if (!isAuthorized(req)) {
    return res.status(401).send("Unauthorized");
  }

  if (req.method === "POST") {
    const body = req.body || {};
    const { id, name, company, review, photo, rating, status, sortOrder } = body;
    const productPhoto = body.productPhoto ?? body.product_photo;
    if (!id || !name || !review) {
      return res.status(400).send("Missing fields");
    }
    const safeRating = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)));
    const safeStatus = status === "pending" ? "pending" : "approved";
    await pool.query(
      `INSERT INTO reviews (id, name, company, review, photo, product_photo, rating, status, sort_order, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         company = EXCLUDED.company,
         review = EXCLUDED.review,
         photo = EXCLUDED.photo,
         product_photo = EXCLUDED.product_photo,
         rating = EXCLUDED.rating,
         status = EXCLUDED.status,
         sort_order = EXCLUDED.sort_order,
         updated_at = NOW()`,
      [id, name, company ?? "", review, photo ?? "", productPhoto ?? "", safeRating, safeStatus, sortOrder ?? 0]
    );
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) return res.status(400).send("Missing id");
    await pool.query("DELETE FROM reviews WHERE id = $1", [id]);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).send("Method not allowed");
};
