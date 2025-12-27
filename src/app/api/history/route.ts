// src/app/api/history/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productKey = (searchParams.get("key") || "").trim();
  const hoursRaw = (searchParams.get("h") || "168").trim();
  const hours = Math.max(1, Math.min(24 * 90, parseInt(hoursRaw, 10) || 168)); // max 90 gün
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);

  if (!productKey) {
    return NextResponse.json({ error: "key gerekli" }, { status: 400 });
  }

  const rows = await prisma.pricePoint.findMany({
    where: { productKey, createdAt: { gte: since } },
    orderBy: { createdAt: "asc" },
    select: {
      createdAt: true,
      price: true,
      shipping: true,
      store: true,
    },
  });

  return NextResponse.json({
    productKey,
    since: since.toISOString(),
    points: rows,
  });
}
