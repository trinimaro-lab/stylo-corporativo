import type { Context, Config } from "@netlify/functions";
import { getDatabase } from "@netlify/database";

const db = getDatabase();

function isAuthorized(req: Request): boolean {
  const token = req.headers.get("x-admin-token");
  const expected = Netlify.env.get("ADMIN_TOKEN");
  return !!expected && !!token && token === expected;
}

// Configuración simple de header/footer, guardada como pares clave/valor.
// GET es público (el sitio la necesita para renderizar); solo escribir
// requiere clave de admin.
export default async (req: Request, context: Context) => {
  if (req.method === "GET") {
    const rows = await db.sql`SELECT key, value FROM site_settings`;
    const settings: Record<string, string> = {};
    for (const row of rows) settings[row.key as string] = row.value as string;
    return Response.json(settings);
  }

  if (!isAuthorized(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (req.method === "POST") {
    const body = await req.json();
    const entries = Object.entries(body ?? {});
    if (!entries.length) {
      return new Response("Missing fields", { status: 400 });
    }
    for (const [key, value] of entries) {
      await db.sql`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES (${key}, ${String(value ?? "")}, NOW())
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
      `;
    }
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/settings",
};
