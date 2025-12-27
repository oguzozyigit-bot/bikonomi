import { NextResponse } from "next/server";
import { dbQuery } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const a = await dbQuery<{ ok: number }>("select 1 as ok");
    const b = await dbQuery<{ exists: boolean }>(
      `select exists (
         select 1
         from information_schema.tables
         where table_schema='public' and table_name='price_points'
       ) as exists`
    );

    let cCount = 0;
    if (b.rows?.[0]?.exists) {
      const c = await dbQuery<{ count: string }>("select count(*)::text as count from public.price_points");
      cCount = Number(c.rows?.[0]?.count || 0);
    }

    return NextResponse.json(
      { ok: true, db: a.rows?.[0]?.ok === 1, price_points: b.rows?.[0]?.exists, rowCount: cCount },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 200 }
    );
  }
}
