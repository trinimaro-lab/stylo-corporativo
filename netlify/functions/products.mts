import type { Context, Config } from "@netlify/functions";
import { getDatabase } from "@netlify/database";

const db = getDatabase();

function isAuthorized(req: Request): boolean {
  const token = req.headers.get("x-admin-token");
  const expected = Netlify.env.get("ADMIN_TOKEN");
  return !!expected && !!token && token === expected;
}

export default async (req: Request, context: Context) => {
  if (req.method === "GET") {
    const rows = await db.sql`
      SELECT id, title, image
      FROM products
      ORDER BY sort_order ASC, updated_at ASC
    `;
    return Response.json(rows);
  }

  if (!isAuthorized(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (req.method === "POST") {
    const body = await req.json();
    const { id, title, image, sortOrder } = body ?? {};
    if (!id || !title || !image) {
      return new Response("Missing fields", { status: 400 });
    }
    await db.sql`
      INSERT INTO products (id, title, image, sort_order, updated_at)
      VALUES (${id}, ${title}, ${image}, ${sortOrder ?? 0}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        image = EXCLUDED.image,
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW()
    `;
    return Response.json({ ok: true });
  }

  if (req.method === "DELETE") {
    const { id } = await req.json();
    if (!id) return new Response("Missing id", { status: 400 });
    await db.sql`DELETE FROM products WHERE id = ${id}`;
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/products",
};
