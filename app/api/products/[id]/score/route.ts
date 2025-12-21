import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { computeBikonomiScoreFromOffers } from "@/lib/bikonomiScore";

export async function POST(
  _: Request,
  { params }: { params: { id: string } }
) {
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
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const { total, breakdown } = computeBikonomiScoreFromOffers(product.offers);

  const updated = await prisma.product.update({
    where: { id: product.id },
    data: { score: total, scoreMeta: breakdown },
    select: { id: true, score: true },
  });

  return NextResponse.json({
    ok: true,
    productId: updated.id,
    score: updated.score,
  });
}

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  return NextResponse.json({
    ok: true,
    id: params.id,
    hint: "Use POST to compute score",
  });
}
