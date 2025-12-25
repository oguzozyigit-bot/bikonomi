import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeBikonomiScoreFromOffers } from "@/lib/bikonomiScore";

// computeBikonomiScoreFromOffers => OfferLite[] bekliyor.
// OfferLite alanlarını burada garanti ediyoruz (özellikle inStock: boolean).
type OfferLiteInput = {
  price: number;
  shippingPrice: number;
  inStock: boolean;
  rating: number;
  reviewCount: number;
};

function normalizeOffer(o: any): OfferLiteInput | null {
  const price = Number(o?.price);
  if (!Number.isFinite(price) || price <= 0) return null;

  const shippingPriceRaw = Number(o?.shippingPrice ?? 0);
  const ratingRaw = Number(o?.rating ?? 0);
  const reviewCountRaw = Number(o?.reviewCount ?? 0);

  return {
    price,
    shippingPrice: Number.isFinite(shippingPriceRaw) ? shippingPriceRaw : 0,
    // stok bilgisi gelmediyse "true" varsayıyoruz (bilinmeyeni cezalandırmamak için)
    inStock: o?.inStock === undefined || o?.inStock === null ? true : Boolean(o.inStock),
    rating: Number.isFinite(ratingRaw) ? ratingRaw : 0,
    reviewCount: Number.isFinite(reviewCountRaw) ? reviewCountRaw : 0,
  };
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1) Body'den offers (opsiyonel)
    const body = await req.json().catch(() => ({} as any));
    const payloadOffers: OfferLiteInput[] = Array.isArray(body?.offers)
      ? (body.offers.map(normalizeOffer).filter(Boolean) as OfferLiteInput[])
      : [];

    // 2) DB'den ürünü ve teklifleri çek
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        offers: {
          select: {
            price: true,
            shippingPrice: true,
            inStock: true,
            rating: true,
            reviewCount: true,
          },
        },
      },
    });

    // 3) Ürün yoksa ama payload offers varsa: payload ile score hesapla (404 yerine 200)
    if (!product) {
      if (payloadOffers.length === 0) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      const { total, breakdown } = computeBikonomiScoreFromOffers(payloadOffers);

      return NextResponse.json({
        ok: true,
        productId: params.id,
        score: total,
        source: "payload",
        breakdown,
      });
    }

    // 4) DB offers + payload offers => hepsini normalize et (inStock boolean garanti)
    const dbOffers: OfferLiteInput[] = (product.offers ?? [])
      .map(normalizeOffer)
      .filter(Boolean) as OfferLiteInput[];

    const mergedOffers: OfferLiteInput[] = [...dbOffers, ...payloadOffers];

    if (mergedOffers.length === 0) {
      return NextResponse.json(
        { error: "No offers found to compute score" },
        { status: 422 }
      );
    }

    // 5) Score hesapla
    const { total, breakdown } = computeBikonomiScoreFromOffers(mergedOffers);

    // 6) DB’ye yaz
    const updated = await prisma.product.update({
      where: { id: product.id },
      data: {
        score: total,
        scoreMeta: breakdown as any,
      },
      select: { id: true, score: true },
    });

    return NextResponse.json({
      ok: true,
      productId: updated.id,
      score: updated.score,
      source: "db",
    });
  } catch (err: any) {
    console.error("score POST error", err);
    return NextResponse.json(
      { error: "Score compute failed", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({
    ok: true,
    id: params.id,
    version: "score-v2-payload-fallback",
    hint: "Use POST to compute score",
    example: {
      offers: [
        {
          price: 1299.9,
          shippingPrice: 0,
          inStock: true,
          rating: 4.6,
          reviewCount: 1287,
        },
      ],
    },
  });
}
