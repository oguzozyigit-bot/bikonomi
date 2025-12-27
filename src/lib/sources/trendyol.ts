import * as cheerio from "cheerio"; // (kalsın, ama HTML fallback yok artık)

function parsePriceTRY(text: any): number {
  if (text == null) return 0;
  if (typeof text === "number") return Number.isFinite(text) ? text : 0;

  const cleaned = String(text)
    .replace(/\s+/g, " ")
    .replace(/[^\d.,]/g, "")
    .trim();

  if (!cleaned) return 0;

  const normalized = cleaned.includes(",")
    ? cleaned.replace(/\./g, "").replace(",", ".")
    : cleaned.replace(/\./g, "");

  const n = Number(normalized);
  return Number.isFinite(n) ? n : 0;
}

function cleanTrendyolTitle(title: string) {
  return (title || "")
    .replace(/\s*[-–]\s*Trendyol.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTrendyolProductId(url: string): string {
  const m = url.match(/-p-(\d+)/i);
  if (!m) throw new Error("Trendyol ürün id bulunamadı (URL içinde -p-XXXX yok).");
  return m[1];
}

async function fetchJsonDirect(url: string) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      "accept-language": "tr-TR,tr;q=0.9,en;q=0.8",
      accept: "application/json,text/plain,*/*",
      referer: "https://www.trendyol.com/",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return await res.json();
}

async function fetchJsonViaScraperApi(targetUrl: string) {
  const key = process.env.SCRAPERAPI_KEY || "";
  if (!key) throw new Error("SCRAPERAPI_KEY yok (proxy fallback devre dışı).");

  const proxyUrl =
    `https://api.scraperapi.com?api_key=${encodeURIComponent(key)}` +
    `&url=${encodeURIComponent(targetUrl)}` +
    `&country_code=tr&render=false`;

  const res = await fetch(proxyUrl, { cache: "no-store" });
  if (!res.ok) throw new Error(`ScraperAPI ${res.status} ${res.statusText}`);

  const txt = await res.text();
  try {
    return JSON.parse(txt);
  } catch {
    throw new Error("ScraperAPI JSON parse edilemedi");
  }
}

function pickFromAnyJson(j: any) {
  // Çeşitli JSON şekillerini tolere ediyoruz:
  const root = j?.result ?? j?.data ?? j;

  // title
  const title =
    root?.name ||
    root?.productName ||
    root?.title ||
    root?.product?.name ||
    root?.product?.productName ||
    root?.product?.title ||
    "Ürün";

  // image
  const image =
    root?.images?.[0] ||
    root?.product?.images?.[0] ||
    root?.imageUrl ||
    root?.product?.imageUrl ||
    root?.image ||
    root?.product?.image ||
    "";

  // price candidates
  const priceCandidates = [
    root?.price?.sellingPrice,
    root?.price?.discountedPrice,
    root?.price?.originalPrice,
    root?.price?.value,
    root?.sellingPrice,
    root?.discountedPrice,
    root?.originalPrice,
    root?.salePrice,
    root?.marketPrice,
    root?.product?.price?.sellingPrice,
    root?.product?.price?.discountedPrice,
    root?.product?.price?.originalPrice,
    root?.product?.sellingPrice,
  ];

  let price = 0;
  for (const c of priceCandidates) {
    const p = parsePriceTRY(c);
    if (p > 0) {
      price = p;
      break;
    }
  }

  // inStock
  const inStock =
    root?.inStock ??
    root?.stockAvailable ??
    root?.availability ??
    root?.product?.inStock ??
    true;

  return {
    title: cleanTrendyolTitle(String(title)),
    image: String(image || ""),
    price,
    shipping: 0,
    inStock: Boolean(inStock),
  };
}

export async function fetchTrendyolProduct(url: string) {
  const productId = extractTrendyolProductId(url);

  // ✅ 1) Birden fazla endpoint dene (hangisi açılırsa)
  const endpoints = [
    `https://www.trendyol.com/api/product/${productId}`,
    `https://www.trendyol.com/api/product-detail/${productId}`,
  ];

  // A) Direkt denemeler
  for (const ep of endpoints) {
    try {
      const j = await fetchJsonDirect(ep);
      const picked = pickFromAnyJson(j);
      if (picked.price > 0) {
        return {
          ...picked,
          productId,
          sourceMode: "api",
          endpoint: ep,
        };
      }
      // fiyat 0 ise yine de devam et (başka endpoint belki doludur)
    } catch {
      // diğer endpoint'e geç
    }
  }

  // B) Proxy (ScraperAPI) ile denemeler
  for (const ep of endpoints) {
    try {
      const j = await fetchJsonViaScraperApi(ep);
      const picked = pickFromAnyJson(j);
      if (picked.price > 0) {
        return {
          ...picked,
          productId,
          sourceMode: "api-proxy",
          endpoint: ep,
        };
      }
    } catch {
      // diğer endpoint'e geç
    }
  }

  // ❌ HTML fallback YOK. Çünkü 410 yiyorsun.
  throw new Error("Trendyol API erişimi başarısız (endpoint/proxy).");
}
