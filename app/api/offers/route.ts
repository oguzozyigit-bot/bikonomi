import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json();

  const offer = await prisma.offer.create({
    data: {
      source: body.source,
      sourceOfferId: body.sourceOfferId,
      url: body.url,
      sellerName: body.sellerName ?? null,
      titleRaw: body.titleRaw,
      price: body.price, // kuruş
      shippingPrice: body.shippingPrice ?? 0,
      inStock: body.inStock ?? true,
      productId: body.productId,
    },
  });

  return NextResponse.json({ ok: true, offer });
}
