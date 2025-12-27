import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * Hepsiburada URL örnekleri:
 * https://www.hepsiburada.com/urun-adi-p-HBCV0000XXXX
 */
function extractHBProductCode(productUrl: string) {
  try {
    const u = new URL(productUrl);
    const m = u.pathname.match(/-p-(HBCV[0-9A-Z]+)/i);
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

  const productCode = extractHBProductCode(productUrl);
  if (!productCode) {
    return NextResponse.json({ error: "Hepsiburada ürün kodu bulunamadı" }, { status: 400 });
  }

  try {
    // Hepsiburada public product endpoint (JSON-LD içerir)
    const apiUrl = `https://www.hepsiburada.com/api/product/${productCode}`;

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
        { error: `Hepsiburada yanıt vermedi (${res.status})` },
        { status: 502 }
      );
    }

    const json: any = await res.json();

    // Fiyat alanları zamanla değişebiliyor → güvenli zincir
    const price =
      json?.price?.current ??
      json?.price?.sale ??
      json?.price ??
      null;

    if (typeof price !== "number") {
      return NextResponse.json({ error: "Fiyat bulunamadı" }, { status: 404 });
    }

    return NextResponse.json({
      source: "hepsiburada",
      price,
      currency: "TRY",
      productCode,
    });
  } catch {
    return NextResponse.json({ error: "Hepsiburada fetch/parse hatası" }, { status: 500 });
  }
}
