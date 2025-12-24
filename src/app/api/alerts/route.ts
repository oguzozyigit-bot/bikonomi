import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";


// ✅ Prisma için Node runtime şart
export const runtime = "nodejs";

function isEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const productId = body?.productId?.toString();
    const email = body?.email?.toString()?.trim();

    const priceTarget =
      body?.priceTarget !== undefined && body?.priceTarget !== null
        ? Number(body.priceTarget)
        : undefined;

    const scoreTarget =
      body?.scoreTarget !== undefined && body?.scoreTarget !== null
        ? Number(body.scoreTarget)
        : undefined;

    if (!productId) {
      return NextResponse.json({ ok: false, error: "productId gerekli" }, { status: 400 });
    }

    if (!email || !isEmail(email)) {
      return NextResponse.json({ ok: false, error: "geçerli email gerekli" }, { status: 400 });
    }

    if (priceTarget !== undefined && !Number.isFinite(priceTarget)) {
      return NextResponse.json({ ok: false, error: "priceTarget sayı olmalı" }, { status: 400 });
    }

    if (
      scoreTarget !== undefined &&
      (!Number.isFinite(scoreTarget) || scoreTarget < 0 || scoreTarget > 100)
    ) {
      return NextResponse.json({ ok: false, error: "scoreTarget 0-100 olmalı" }, { status: 400 });
    }

    const alert = await prisma.productAlert.create({
      data: {
        productId,
        email,
        priceTarget: priceTarget !== undefined ? priceTarget : null,
        scoreTarget: scoreTarget !== undefined ? Math.round(scoreTarget) : null,
      },
    });

    return NextResponse.json({ ok: true, alertId: alert.id });
  } catch (err: any) {
    // ✅ 500'de terminale sebebi düşsün
    console.error("POST /api/alerts error:", err);
    return NextResponse.json({ ok: false, error: "İç sunucu hatası" }, { status: 500 });
  }
}
