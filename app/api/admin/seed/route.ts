import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { seedProducts } from "@/lib/seed"; // senin TS seed'in

const prisma = new PrismaClient();

export async function POST() {
  try {
    for (const p of seedProducts) {
      await prisma.product.upsert({
        where: { id: p.id },
        update: {
          title: p.title,
          category: p.category,
          score: p.score,
          cheapestPrice: p.cheapestPrice,
          currency: p.currency,
          cheapestStore: p.cheapestStore,
          marketDeltaPct: p.marketDeltaPct,
          history: p.history as any,
          breakdown: p.breakdown as any,
          offers: p.offers as any,
        },
        create: {
          id: p.id,
          title: p.title,
          category: p.category,
          score: p.score,
          cheapestPrice: p.cheapestPrice,
          currency: p.currency,
          cheapestStore: p.cheapestStore,
          marketDeltaPct: p.marketDeltaPct,
          history: p.history as any,
          breakdown: p.breakdown as any,
          offers: p.offers as any,
        },
      });
    }

    return NextResponse.json({ ok: true, count: seedProducts.length });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
