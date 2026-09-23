const { getPool, isAuthorized } = require("./_lib/db");

// Configuración simple de header/footer, guardada como pares clave/valor.
// GET es público (el sitio la necesita para renderizar); solo escribir
// requiere clave de admin.
module.exports = async function handler(req, res) {
  const pool = getPool();

  if (req.method === "GET") {
    const { rows } = await pool.query("SELECT key, value FROM site_settings");
    const settings = {};
    for (const row of rows) settings[row.key] = row.value;
    return res.status(200).json(settings);
  }

  if (!isAuthorized(req)) {
    return res.status(401).send("Unauthorized");
  }

  if (req.method === "POST") {
    const entries = Object.entries(req.body || {});
    if (!entries.length) {
      return res.status(400).send("Missing fields");
    }
    for (const [key, value] of entries) {
      await pool.query(
        `INSERT INTO site_settings (key, value, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [key, String(value ?? "")]
      );
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(405).send("Method not allowed");
};
