import { NextResponse } from "next/server";
import { appendPoint } from "@/lib/historyStore";
import { deleteFromCache } from "@/lib/cache";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const productKey = String(body.productKey || "").trim();
    const price = Number(body.price || 0);
    const shipping = Number(body.shipping || 0);

    if (!productKey) return NextResponse.json({ ok: false }, { status: 400 });
    if (!Number.isFinite(price) || price <= 0)
      return NextResponse.json({ ok: false }, { status: 400 });

    const total = Math.round(price) + Math.max(0, Math.round(shipping));
    appendPoint(productKey, total, "contrib");

    // ✅ cache invalidation: yeni market/score için
    await deleteFromCache(productKey);

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
