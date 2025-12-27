// src/app/api/analyze/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

import { normalizeUrl } from "@/lib/normalizeUrl";
import { getFromCache, setToCache } from "@/lib/cache";
import { fetchSource } from "@/lib/fetchSource";
import { buildProductMeta } from "@/lib/productMeta";
import { computeMarket } from "@/lib/market";
import { computeScore, computeOfferVerdict } from "@/lib/score";
import { buildSearchLinks } from "@/lib/searchLinks";

import type { AnalyzeResponse, Offer, Source } from "@/lib/types";

export const runtime = "nodejs";

const FALLBACK_IMAGE =
  "https://dummyimage.com/600x600/111827/ffffff&text=Bikonomi";

function failSoftResponse(params: {
  message: string;
  source?: Source;
  productKey?: string;
  title?: string;
  image?: string;
  allowManual?: boolean;
}): AnalyzeResponse {
  const title = params.title || "Ürün";
  const image = params.image || FALLBACK_IMAGE;
  return {
    ok: true, // ✅ 500 yok: her zaman JSON
    mode: "manual_required",
    message: params.message,
    product: {
      productKey: params.productKey || "unknown:product",
      source: params.source || "Other",
      title,
      image,
    },
    market: { avgPrice: null, confidence: 0, sampleCount: 0 },
    score: {
      final: 60,
      verdict: "Düşünülebilir",
      summary: "Fiyat makul, alternatifler kontrol edilebilir.",
      breakdown: { price: 20, shipping: 14, trust: 16, market: 10 },
    },
    offers: [],
    actions: {
      allowManual: params.allowManual ?? true,
      searchLinks: buildSearchLinks(title),
    },
  };
}

// ✅ Her analizde offer bazlı PricePoint yaz
async function writePricePoints(productKey: string, offers: Offer[]) {
  if (!productKey || !offers?.length) return;

  const cleanOffers = offers.filter(
    (o) => Number(o.price ?? 0) + Number(o.shipping ?? 0) > 0
  );
  if (!cleanOffers.length) return;

  await prisma.pricePoint.createMany({
    data: cleanOffers.map((o) => ({
      productKey,
      store: String((o as any).store ?? (o as any).source ?? "Unknown"),
      price: Math.round(Number(o.price ?? 0)),
      shipping: Math.round(Number(o.shipping ?? 0)),
      inStock: o.inStock === undefined ? true : Boolean(o.inStock),
      url: (o as any).url ?? null, // ✅ sade: string | null
    })),
    skipDuplicates: false,
  });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raw = (searchParams.get("u") || "").trim();

    // 1) URL normalize
    let normalized: { productKey: string; source: Source; cleanUrl: string };
    try {
      normalized = normalizeUrl(raw);
    } catch {
      return NextResponse.json(
        failSoftResponse({ message: "Geçersiz link." }),
        { status: 200 }
      );
    }

    const { productKey, source, cleanUrl } = normalized;

    // 2) Cache read (fail-soft)
    try {
      const cached = await getFromCache(productKey);
      if (cached) return NextResponse.json(cached, { status: 200 });
    } catch (e) {
      console.error("CACHE READ ERROR:", e);
    }

    // 3) Meta (fail-soft)
    let meta = { title: "Ürün", image: FALLBACK_IMAGE };
    try {
      meta = await buildProductMeta(cleanUrl, source);
    } catch (e) {
      console.error("META ERROR:", e);
    }

    // 4) Offers (fail-soft)
    let offers: Offer[] = [];
    let mode: "auto" | "partial" | "manual_required" = "manual_required";
    try {
      const fetched = await fetchSource(cleanUrl, source);
      if (fetched?.offers?.length) {
        offers = fetched.offers;
        mode = "auto";
      } else {
        mode = "partial";
        offers = [];
      }
    } catch (e) {
      console.error("FETCH SOURCE ERROR:", e);
      mode = "manual_required";
      offers = [];
    }

    // 5) Market (DB patlasa bile 500 yok)
    let market = { avgPrice: null, confidence: 0, sampleCount: 0 };
    try {
      market = await computeMarket(productKey);
    } catch (e) {
      console.error("MARKET/DB ERROR:", e);
      return NextResponse.json(
        failSoftResponse({
          message:
            "Veritabanı bağlantısı geçici olarak sorunlu. Manuel fiyat ekleyebilirsin.",
          source,
          productKey,
          title: meta.title,
          image: meta.image,
          allowManual: true,
        }),
        { status: 200 }
      );
    }

    const marketAvg = market.avgPrice ?? null;

    // 6) offers: total + verdict
    const bestTotal =
      offers.length > 0
        ? Math.min(
            ...offers
              .map((o) => (o.price || 0) + (o.shipping || 0))
              .filter((t) => t > 0)
          )
        : null;

    try {
      offers = offers.map((o) => {
        const total = (o.price || 0) + (o.shipping || 0);
        const verdict = computeOfferVerdict({
          offer: { ...o, total } as any,
          marketAvg,
          bestTotal,
        });
        return { ...o, total, verdict } as any;
      });
    } catch (e) {
      console.error("OFFER VERDICT ERROR:", e);
    }

    // 7) ✅ PricePoint write (fail-soft)
    try {
      if ((mode === "auto" || mode === "partial") && offers.length > 0) {
        await writePricePoints(productKey, offers);
      }
    } catch (e) {
      console.error("PRICEPOINT WRITE ERROR:", e);
    }

    // 8) score (her koşulda)
    let score: AnalyzeResponse["score"];
    try {
      score = computeScore({ offers, market }) as any;
    } catch (e) {
      console.error("SCORE ERROR:", e);
      score = {
        final: 60,
        verdict: "Düşünülebilir",
        summary: "Fiyat makul, alternatifler kontrol edilebilir.",
        breakdown: { price: 20, shipping: 14, trust: 16, market: 10 },
      };
    }

    const resp: AnalyzeResponse = {
      ok: true,
      mode,
      product: { productKey, source, title: meta.title, image: meta.image },
      market,
      score,
      offers,
      actions: {
        allowManual: mode !== "auto",
        searchLinks: buildSearchLinks(meta.title),
      },
      message:
        mode === "manual_required"
          ? "Bu linkten otomatik veri alınamadı."
          : undefined,
    };

    // 9) Cache write (fail-soft)
    try {
      await setToCache(productKey, resp);
    } catch (e) {
      console.error("CACHE WRITE ERROR:", e);
    }

    return NextResponse.json(resp, { status: 200 });
  } catch (e) {
    console.error("ANALYZE FATAL ERROR:", e);
    return NextResponse.json(
      failSoftResponse({ message: "Analiz alınamadı. Biraz sonra tekrar dene." }),
      { status: 200 }
    );
  }
}
