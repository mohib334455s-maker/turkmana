import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.DEMO_AUTH === "true" || !process.env.DATABASE_URL) {
    return Response.json({ ok: true, mode: "demo" });
  }

  try {
    const { db } = await import("@/db");
    await db.execute(sql`select 1`);
    return Response.json({ ok: true, mode: "postgres" });
  } catch {
    return Response.json({ ok: false }, { status: 500 });
  }
}
