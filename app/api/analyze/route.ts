import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = (body?.url ?? "").toString().trim();
    if (!url) {
      return NextResponse.json({ ok: false, error: "url_required" }, { status: 400 });
    }

    // ✅ Bugün mock hesap (yarın gerçek analiz bağlarız)
    const score = 72;

    // ✅ Şemanın istediği zorunlu alanları dolduruyoruz (hatasız create için)
    const created = await prisma.product.create({
      data: {
        // id: String @id (default yok) → kendimiz üretmeliyiz
        id: crypto.randomUUID(),

        title: "Linkten Gelen Ürün",
        category: "Genel",
        score,

        // cheapestPrice Int → Int yaz
        cheapestPrice: 1299,
        currency: "TRY",

        cheapestStore: "unknown",
        marketDeltaPct: 0,

        // Json zorunlu alanlar → boş objeler
        history: {},
        breakdown: {},
        offers: [],
        // offers Json ise array de olur; şeman Json olduğundan {} da olur ama biz offers'i liste tutalım
      },
      select: { id: true, score: true },
    });

    return NextResponse.json({ ok: true, id: created.id, score: created.score });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
