import { sql } from "drizzle-orm";
import { isDemoAuth } from "@/lib/demo-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (isDemoAuth()) {
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
