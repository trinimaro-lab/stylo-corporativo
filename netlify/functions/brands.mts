import type { Context, Config } from "@netlify/functions";
import { getDatabase } from "@netlify/database";

const db = getDatabase();

function isAuthorized(req: Request): boolean {
  const token = req.headers.get("x-admin-token");
  const expected = Netlify.env.get("ADMIN_TOKEN");
  return !!expected && !!token && token === expected;
}

// Título, descripción y foto colage de la sección "Marcas que confían en
// nosotros" (fila única, id fijo "main"). El grid de logos vive en
// /api/brand-logos.
export default async (req: Request, context: Context) => {
  if (req.method === "GET") {
    const rows = await db.sql`
      SELECT title, description, collage_image AS "collageImage"
      FROM brand_section
      WHERE id = 'main'
    `;
    return Response.json(rows[0] ?? null);
  }

  if (!isAuthorized(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (req.method === "POST") {
    const body = await req.json();
    const { title, description, collageImage } = body ?? {};
    if (!title) {
      return new Response("Missing fields", { status: 400 });
    }
    await db.sql`
      INSERT INTO brand_section (id, title, description, collage_image, updated_at)
      VALUES ('main', ${title}, ${description ?? ""}, ${collageImage ?? ""}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        collage_image = EXCLUDED.collage_image,
        updated_at = NOW()
    `;
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/brands",
};
