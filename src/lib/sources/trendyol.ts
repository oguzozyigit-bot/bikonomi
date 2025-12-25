import * as cheerio from "cheerio";

type FetchResult = {
  source: "trendyol";
  product: {
    title: string;
    price: number | null;
    currency: "TRY";
    url: string;
    image: string | null;
  };
  debug?: Record<string, any>;
};

function pickMeta($: cheerio.CheerioAPI, selectors: string[]): string | null {
  for (const sel of selectors) {
    const v = $(sel).attr("content") || $(sel).attr("value");
    if (v && v.trim()) return v.trim();
  }
  return null;
}

function parsePriceLike(input: string | null): number | null {
  if (!input) return null;

  // "1.299,90 TL" | "1299.90" | "1299,90" | "1.299,90"
  let s = input
    .replace(/\s/g, "")
    .replace(/TL|TRY|₺/gi, "")
    .trim();

  // Eğer hem nokta hem virgül varsa: binlik/ondalık ayrımı
  // "1.299,90" -> "1299.90"
  if (s.includes(".") && s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (s.includes(",")) {
    // "1299,90" -> "1299.90"
    s = s.replace(",", ".");
  }

  // kalan her şeyi temizle
  s = s.replace(/[^\d.]/g, "");

  const n = Number(s);
  if (!Number.isFinite(n)) return null;
  if (n <= 0) return null;
  return n;
}

function parseJsonLd($: cheerio.CheerioAPI): any[] {
  const out: any[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
    const txt = $(el).text()?.trim();
    if (!txt) return;
    try {
      const parsed = JSON.parse(txt);
      if (Array.isArray(parsed)) out.push(...parsed);
      else out.push(parsed);
    } catch {
      // bazı sayfalar JSON-LD içinde ufak kaçaklar yapabiliyor, sessiz geç
    }
  });
  return out;
}

function extractFromLd(ld: any[]): { title?: string; image?: string; price?: number } {
  // Trendyol'da bazen Product/Offer yapıları var.
  for (const node of ld) {
    const n = node?.["@graph"] ? node["@graph"] : [node];
    for (const item of n) {
      const type = item?.["@type"];
      if (type === "Product" || (Array.isArray(type) && type.includes("Product"))) {
        const title = item?.name;
        let image: string | undefined;
        if (typeof item?.image === "string") image = item.image;
        else if (Array.isArray(item?.image) && item.image[0]) image = item.image[0];

        // Offers
        const offers = item?.offers;
        let price: number | undefined;
        const pRaw =
          offers?.price ??
          offers?.lowPrice ??
          offers?.highPrice ??
          offers?.offers?.price; // bazen nested

        const parsed = parsePriceLike(typeof pRaw === "string" || typeof pRaw === "number" ? String(pRaw) : null);
        if (parsed) price = parsed;

        return { title, image, price };
      }
    }
  }
  return {};
}

export async function fetchTrendyol(url: string): Promise<FetchResult> {
  const res = await fetch(url, {
    method: "GET",
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123 Safari/537.36",
      "accept-language": "tr-TR,tr;q=0.9,en;q=0.8",
      accept: "text/html,application/xhtml+xml",
    },
    // Next fetch cache kapat
    cache: "no-store",
  });

  const html = await res.text();
  const $ = cheerio.load(html);

  const metaTitle =
    pickMeta($, ['meta[property="og:title"]', 'meta[name="twitter:title"]']) ||
    $("title").first().text().trim() ||
    "";

  const metaImage = pickMeta($, [
    'meta[property="og:image"]',
    'meta[property="og:image:secure_url"]',
    'meta[name="twitter:image"]',
    'meta[name="twitter:image:src"]',
  ]);

  // Meta price (varsa)
  const metaPriceRaw = pickMeta($, [
    'meta[property="product:price:amount"]',
    'meta[property="og:price:amount"]',
    'meta[name="price"]',
    'meta[itemprop="price"]',
  ]);
  const metaPrice = parsePriceLike(metaPriceRaw);

  // JSON-LD dene
  const ld = parseJsonLd($);
  const fromLd = extractFromLd(ld);

  const price = fromLd.price ?? metaPrice ?? null;
  const image = fromLd.image ?? metaImage ?? null;

  return {
    source: "trendyol",
    product: {
      title: (fromLd.title ?? metaTitle ?? "").trim(),
      price,
      currency: "TRY",
      url,
      image,
    },
    debug: {
      status: res.status,
      hasLd: ld.length > 0,
      metaPriceRaw: metaPriceRaw ?? null,
      metaImage: metaImage ?? null,
    },
  };
}
