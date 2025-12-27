import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Vercel/Node fetch için stabil

function extractTrendyolProductId(productUrl: string) {
  // Trendyol URL örnekleri:
  // /marka/urun-adi-p-123456789
  // /urun-adi-p-123456789
  try {
    const u = new URL(productUrl);
    const m = u.pathname.match(/-p-(\d+)/i);
    return m?.[1] || null;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productUrl = searchParams.get("u") || "";

  if (!productUrl) {
    return NextResponse.json({ error: "URL yok" }, { status: 400 });
  }

  const productId = extractTrendyolProductId(productUrl);

  if (!productId) {
    return NextResponse.json({ error: "Trendyol ürün ID bulunamadı" }, { status: 400 });
  }

  try {
    // Trendyol public product detail JSON
    const apiUrl = `https://public.trendyol.com/discovery-web-productgw-service/api/productDetail/${productId}`;

    const res = await fetch(apiUrl, {
      method: "GET",
      headers: {
        accept: "application/json",
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Trendyol yanıt vermedi (${res.status})` },
        { status: 502 }
      );
    }

    const json: any = await res.json();

    const price =
      json?.result?.price?.discountedPrice ??
      json?.result?.price?.sellingPrice ??
      null;

    if (typeof price !== "number") {
      return NextResponse.json({ error: "Fiyat bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({
      source: "trendyol",
      price,
      currency: "TRY",
      productId,
    });
  } catch {
    return NextResponse.json({ error: "Trendyol parse/fetch hatası" }, { status: 500 });
  }
}
