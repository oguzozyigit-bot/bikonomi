// src/app/api/analyze/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { normalizeUrl } from "@/lib/normalizeUrl";
import { fetchTrendyolProduct } from "@/lib/sources/trendyol";
import { appendPrice, getHistory } from "@/lib/historyStore";
import { computeBikonomiScore, Offer } from "@/lib/score";
import crypto from "crypto";

const BUILD_ID = "ANALYZE_ROUTE_V8_MANUAL_PRICE_FINAL";

function hashId(input: string) {
  return crypto.createHash("sha1").update(input).digest("hex").slice(0, 16);
}

function parseManualPrice(raw: string | null): number {
  if (!raw) return 0;
  const cleaned = raw.replace(/\s+/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

type HistoryPoint = { date: string; price: number };

function coerceHistoryPoints(historyRaw: any): HistoryPoint[] {
  const arr = Array.isArray(historyRaw)
    ? historyRaw
    : Array.isArray(historyRaw?.points)
      ? historyRaw.points
      : [];

  return arr
    .filter(Boolean)
    .map((x: any) => ({
      date: String(x.date ?? x.createdAt ?? x.t ?? ""),
      price: Number(x.price ?? x.value ?? x.p ?? 0),
    }))
    .filter((x: HistoryPoint) => Boolean(x.date) && Number.isFinite(x.price));
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const rawUrl = (searchParams.get("u") || "").trim();
    const rawPrice = (searchParams.get("p") || "").trim();

    if (!rawUrl) {
      return NextResponse.json({ error: "URL gerekli", buildId: BUILD_ID }, { status: 400 });
    }

    const manualPrice = parseManualPrice(rawPrice);

    let source: string, clean: string;
    try {
      const norm = normalizeUrl(rawUrl);
      source = norm.source;
      clean = norm.clean;
    } catch {
      return NextResponse.json({ error: "Geçersiz URL", buildId: BUILD_ID }, { status: 400 });
    }

    const productId = hashId(clean);

    let title = "Ürün";
    let image = "https://dummyimage.com/600x600/111827/ffffff&text=Bikonomi";
    let offers: Offer[] = [];

    // 1) Trendyol otomatik deneme (başarısız olabilir)
    if (source === "trendyol") {
      try {
        const p = await fetchTrendyolProduct(clean);
        title = p.title || title;
        image = p.image || image;

        if (p.price && p.price > 0) {
          offers = [
            {
              store: "Trendyol",
              price: p.price,
              shipping: p.shipping ?? 0,
              inStock: p.inStock ?? true,
              url: clean,
            },
          ];
        }
      } catch {
        // sessiz geç → manuel fallback'e düş
      }
    }

    // 2) Manuel fiyat fallback (kritik)
    if (!offers.length && manualPrice > 0) {
      offers = [
        {
          store: "Trendyol",
          price: manualPrice,
          shipping: 0,
          inStock: true,
          url: clean,
        },
      ];
    }

    if (!Array.isArray(offers)) {
      return NextResponse.json(
        { error: "Sunucu iç hatası", detail: "Offers üretilemedi", buildId: BUILD_ID },
        { status: 500 }
      );
    }

    if (!offers.length) {
      return NextResponse.json(
        {
          error: "Kaynak verisi alınamadı",
          detail: "Otomatik veri alınamadı ve manuel fiyat da algılanmadı.",
          source,
          buildId: BUILD_ID,
          debug: { rawPrice, manualPrice },
        },
        { status: 502 }
      );
    }

    // 3) History + score
    const cheapestTotal = offers
      .filter((o) => o.inStock)
      .reduce((m, o) => Math.min(m, o.price + (o.shipping || 0)), Infinity);

    if (Number.isFinite(cheapestTotal) && cheapestTotal > 0) {
      await appendPrice(productId, cheapestTotal);
    }

    const historyRaw = await getHistory(productId);
    const historyPoints = coerceHistoryPoints(historyRaw);

    const scorePack = computeBikonomiScore({
      offers,
      history: historyPoints,
    });

    return NextResponse.json(
      {
        buildId: BUILD_ID,
        productId,
        source,
        cleanUrl: clean,
        title,
        image,
        offers,
        history: historyPoints,
        manualPriceUsed: manualPrice > 0,
        ...scorePack,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        error: "Sunucu hatası",
        detail: e?.message || String(e),
        buildId: BUILD_ID,
      },
      { status: 500 }
    );
  }
}
