import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeBikonomiScoreFromOffers } from "@/lib/bikonomiScore";

type OfferInput = {
  price: number;
  shippingPrice?: number | null;
  inStock?: boolean | null;
  rating?: number | null;
  reviewCount?: number | null;
};

function normalizeOffer(o: any): OfferInput | null {
  const price = Number(o?.price);
  if (!Number.isFinite(price) || price <= 0) return null;

  const shippingPrice = o?.shippingPrice == null ? null : Number(o.shippingPrice);
  const rating = o?.rating == null ? null : Number(o.rating);
  const reviewCount = o?.reviewCount == null ? null : Number(o.reviewCount);

  return {
    price,
    shippingPrice: Number.isFinite(shippingPrice as number) ? shippingPrice : null,
    inStock: o?.inStock == null ? null : Boolean(o.inStock),
    rating: Number.isFinite(rating as number) ? rating : null,
    reviewCount: Number.isFinite(reviewCount as number) ? reviewCount : null,
  };
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const payloadOffers: OfferInput[] = Array.isArray(body?.offers)
      ? (body.offers.map(normalizeOffer).filter(Boolean) as OfferInput[])
      : [];

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

    const mergedOffers: OfferInput[] = [
      ...(product.offers ?? []),
      ...payloadOffers,
    ];

    if (mergedOffers.length === 0) {
      return NextResponse.json(
        { error: "No offers found to compute score" },
        { status: 422 }
      );
    }

    const { total, breakdown } = computeBikonomiScoreFromOffers(mergedOffers);

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
        { price: 1299.9, shippingPrice: 0, inStock: true, rating: 4.6, reviewCount: 1287 },
      ],
    },
  });
}