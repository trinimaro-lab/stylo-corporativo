const { getPool, isAuthorized } = require("./_lib/db");

module.exports = async function handler(req, res) {
  const pool = getPool();

  if (req.method === "GET") {
    const { rows } = await pool.query(
      `SELECT id, image, alt FROM brand_logos ORDER BY sort_order ASC, updated_at ASC`
    );
    return res.status(200).json(rows);
  }

  if (!isAuthorized(req)) {
    return res.status(401).send("Unauthorized");
  }

  if (req.method === "POST") {
    const { id, image, alt, sortOrder } = req.body || {};
    if (!id || !image) {
      return res.status(400).send("Missing fields");
    }
    await pool.query(
      `INSERT INTO brand_logos (id, image, alt, sort_order, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (id) DO UPDATE SET
         image = EXCLUDED.image,
         alt = EXCLUDED.alt,
         sort_order = EXCLUDED.sort_order,
         updated_at = NOW()`,
      [id, image, alt ?? "", sortOrder ?? 0]
    );
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) return res.status(400).send("Missing id");
    await pool.query("DELETE FROM brand_logos WHERE id = $1", [id]);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).send("Method not allowed");
};
