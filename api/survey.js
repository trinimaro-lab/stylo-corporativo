const crypto = require("crypto");
const { getPool } = require("./_lib/db");

function clip(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

// Endpoint público (sin clave) para la encuesta que se le entrega a los
// clientes. Las respuestas entran como reseñas "pending": no aparecen en el
// carrusel público hasta que un administrador las aprueba en el panel.
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const body = req.body || {};
  const name = clip(body.name, 120);
  const company = clip(body.company, 120);
  const review = clip(body.review, 2000);
  const rating = Math.min(5, Math.max(1, Math.round(Number(body.rating) || 0)));

  const productPhoto = String(body.productPhoto ?? "");
  if (productPhoto && (!productPhoto.startsWith("data:image/") || productPhoto.length > 6000000)) {
    return res.status(400).send("Invalid photo");
  }

  if (!name || !review || !rating) {
    return res.status(400).send("Missing fields");
  }

  const pool = getPool();
  const id = crypto.randomUUID();
  await pool.query(
    `INSERT INTO reviews (id, name, company, review, photo, product_photo, rating, status, sort_order, updated_at, submitted_at)
     VALUES ($1, $2, $3, $4, '', $5, $6, 'pending', 0, NOW(), NOW())`,
    [id, name, company, review, productPhoto, rating]
  );

  return res.status(200).json({ ok: true });
};
