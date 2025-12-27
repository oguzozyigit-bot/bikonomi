// src/lib/historyStore.ts
import { dbQuery } from "@/lib/db";

type Point = { t: number; total: number; kind: "auto" | "contrib" };

// RAM fallback (DB yoksa)
const MEM = new Map<string, Point[]>();

export async function appendPoint(productKey: string, total: number, kind: Point["kind"]) {
  const pk = String(productKey || "").trim();
  const tot = Math.round(Number(total));
  if (!pk || !Number.isFinite(tot) || tot <= 0) return;

  if (!process.env.DATABASE_URL) {
    const arr = MEM.get(pk) ?? [];
    arr.push({ t: Date.now(), total: tot, kind });
    MEM.set(pk, arr.slice(-200));
    return;
  }

  await dbQuery(
    `insert into public.price_points (product_key, kind, total)
     values ($1, $2, $3)`,
    [pk, kind, tot]
  );
}

export async function getRecentPoints(productKey: string, days: number) {
  const pk = String(productKey || "").trim();

  if (!process.env.DATABASE_URL) {
    const arr = MEM.get(pk) ?? [];
    const since = Date.now() - days * 24 * 3600_000;
    return arr.filter((p) => p.t >= since);
  }

  // ✅ POSTGRES DOĞRU INTERVAL KULLANIMI
  const { rows } = await dbQuery<{
    created_at: string;
    total: number;
    kind: "auto" | "contrib";
  }>(
    `
    select created_at, total, kind
    from public.price_points
    where product_key = $1
      and created_at >= now() - make_interval(days => $2)
    order by created_at desc
    limit 200
    `,
    [pk, days]
  );

  return rows.map((r) => ({
    t: new Date(r.created_at).getTime(),
    total: Number(r.total),
    kind: r.kind,
  }));
}
