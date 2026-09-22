import type { Context, Config } from "@netlify/functions";
import { getDatabase } from "@netlify/database";
import { randomUUID } from "node:crypto";

const db = getDatabase();

function clip(value: unknown, max: number): string {
  return String(value ?? "").trim().slice(0, max);
}

// Endpoint público (sin clave) para la encuesta que se le entrega a los
// clientes. Las respuestas entran como reseñas "pending": no aparecen en el
// carrusel público hasta que un administrador las aprueba en el panel.
export default async (req: Request, context: Context) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return new Response("Invalid JSON", { status: 400 });
  }

  const name = clip(body?.name, 120);
  const company = clip(body?.company, 120);
  const review = clip(body?.review, 2000);
  const rating = Math.min(5, Math.max(1, Math.round(Number(body?.rating) || 0)));

  let productPhoto = String(body?.productPhoto ?? "");
  if (productPhoto && (!productPhoto.startsWith("data:image/") || productPhoto.length > 6_000_000)) {
    return new Response("Invalid photo", { status: 400 });
  }

  if (!name || !review || !rating) {
    return new Response("Missing fields", { status: 400 });
  }

  const id = randomUUID();
  await db.sql`
    INSERT INTO reviews (id, name, company, review, photo, product_photo, rating, status, sort_order, updated_at, submitted_at)
    VALUES (${id}, ${name}, ${company}, ${review}, '', ${productPhoto}, ${rating}, 'pending', 0, NOW(), NOW())
  `;

  return Response.json({ ok: true });
};

export const config: Config = {
  path: "/api/survey",
};
