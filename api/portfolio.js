const { getPool, isAuthorized } = require("./_lib/db");

module.exports = async function handler(req, res) {
  const pool = getPool();

  if (req.method === "GET") {
    const { rows } = await pool.query(
      `SELECT id, title, category, label, image, description
       FROM portfolio_works
       ORDER BY sort_order ASC, updated_at ASC`
    );
    return res.status(200).json(rows);
  }

  if (!isAuthorized(req)) {
    return res.status(401).send("Unauthorized");
  }

  if (req.method === "POST") {
    const { id, title, category, label, image, description, sortOrder } = req.body || {};
    if (!id || !title || !category || !label || !image) {
      return res.status(400).send("Missing fields");
    }
    await pool.query(
      `INSERT INTO portfolio_works (id, title, category, label, image, description, sort_order, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (id) DO UPDATE SET
         title = EXCLUDED.title,
         category = EXCLUDED.category,
         label = EXCLUDED.label,
         image = EXCLUDED.image,
         description = EXCLUDED.description,
         sort_order = EXCLUDED.sort_order,
         updated_at = NOW()`,
      [id, title, category, label, image, description ?? "", sortOrder ?? 0]
    );
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const { id } = req.body || {};
    if (!id) return res.status(400).send("Missing id");
    await pool.query("DELETE FROM portfolio_works WHERE id = $1", [id]);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).send("Method not allowed");
};
