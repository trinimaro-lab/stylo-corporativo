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
    // Público: solo reseñas aprobadas (para el carrusel de testimonios).
    // Con token de admin: todas, incluidas las pendientes de la encuesta.
    const rows = isAuthorized(req)
      ? await db.sql`
          SELECT id, name, company, review, photo, product_photo, rating, status, submitted_at
          FROM reviews
          ORDER BY (status = 'pending') DESC, submitted_at DESC
        `
      : await db.sql`
          SELECT id, name, company, review, photo, product_photo, rating, status, submitted_at
          FROM reviews
          WHERE status = 'approved'
          ORDER BY sort_order ASC, updated_at ASC
        `;
    return Response.json(rows);
  }

  if (!isAuthorized(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (req.method === "POST") {
    const body = await req.json();
    const { id, name, company, review, photo, rating, status, sortOrder } = body ?? {};
    // acepta camelCase (encuesta) o snake_case (lo que devuelve el propio GET al panel).
    const productPhoto = body?.productPhoto ?? body?.product_photo;
    if (!id || !name || !review) {
      return new Response("Missing fields", { status: 400 });
    }
    const safeRating = Math.min(5, Math.max(1, Math.round(Number(rating) || 5)));
    const safeStatus = status === "pending" ? "pending" : "approved";
    await db.sql`
      INSERT INTO reviews (id, name, company, review, photo, product_photo, rating, status, sort_order, updated_at)
      VALUES (${id}, ${name}, ${company ?? ""}, ${review}, ${photo ?? ""}, ${productPhoto ?? ""}, ${safeRating}, ${safeStatus}, ${sortOrder ?? 0}, NOW())
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        company = EXCLUDED.company,
        review = EXCLUDED.review,
        photo = EXCLUDED.photo,
        product_photo = EXCLUDED.product_photo,
        rating = EXCLUDED.rating,
        status = EXCLUDED.status,
        sort_order = EXCLUDED.sort_order,
        updated_at = NOW()
    `;
    return Response.json({ ok: true });
  }

  if (req.method === "DELETE") {
    const { id } = await req.json();
    if (!id) return new Response("Missing id", { status: 400 });
    await db.sql`DELETE FROM reviews WHERE id = ${id}`;
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/reviews",
};
