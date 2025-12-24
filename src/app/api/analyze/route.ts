// app/api/analyze/route.ts
import { NextResponse } from "next/server";
import { isAllowed, normalizeUrl } from "../../../lib/allowedDomains";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("url") || "";

  let url: URL;
  try {
    url = normalizeUrl(raw);
  } catch {
    return NextResponse.json({ error: "Geçersiz URL" }, { status: 400 });
  }

  if (!isAllowed(url)) {
    return NextResponse.json(
      { error: "Bu site şu an desteklenmiyor (izinli listede değil)." },
      { status: 400 }
    );
  }

  const demo = {
    title: `Analiz (Demo): ${url.hostname.replace(/^www\./, "")}`,
    cheapestPrice: 1249,
    currency: "₺",
    cheapestStore: "A Mağazası",
    score: 82,
    offers: [
      { store: "A Mağazası", price: 1249, inStock: true, url: url.toString() },
      { store: "B Mağazası", price: 1399, inStock: true, url: url.toString() },
      { store: "C Mağazası", price: 1499, inStock: false, url: url.toString() },
    ],
  };

  return NextResponse.json(demo);
}
