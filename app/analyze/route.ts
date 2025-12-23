// app/api/analyze/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const url = (body?.url ?? "").toString().trim();

    if (!url) {
      return NextResponse.json({ ok: false, error: "url_required" }, { status: 400 });
    }

    // ✅ Şimdilik mock skor (yarın gerçek hesap bağlarız)
    const score = 72;

    // ✅ Basit başlık (yarın scrape/metadata)
    const title = "Linkten Gelen Ürün";

    // ✅ Basit fiyat (yarın offer toplama)
    const cheapestPrice = 1299.9;

    // ✅ DB’ye kaydet
    const created = await prisma.product.create({
      data: {
        title,
        score,
        cheapestPrice,
        sourceUrl: url, // modelinde yoksa aşağıdaki notu oku
      },
      select: { id: true, score: true },
    });

    return NextResponse.json({ ok: true, id: created.id, score: created.score });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
