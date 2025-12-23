import { NextResponse } from "next/server";
import { upsertProductWithOffers } from "@/lib/dbWrite";
import { normalizeFromUrl } from "@/lib/sourceRouter";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const url = body?.url?.toString();
  if (!url) {
    return NextResponse.json({ ok: false, error: "url required" }, { status: 400 });
  }

  // 1) Analyze / normalize
  const normalized = await normalizeFromUrl(url);

  // 2) DB write
  const product = await upsertProductWithOffers(normalized);

  return NextResponse.json({ ok: true, productId: product.id });
}
