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

  let s = input.replace(/\s/g, "").replace(/TL|TRY|₺/gi, "").trim();

  if (s.includes(".") && s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (s.includes(",")) s = s.replace(",", ".");

  s = s.replace(/[^\d.]/g, "");
  const n = Number(s);
  if (!Number.isFinite(n) || n <= 0) return null;
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
    } catch {}
  });
  return out;
}

function normalizeOffersPrice(offers: any): number | null {
  if (!offers) return null;
  const candidates: any[] = [];
  if (Array.isArray(offers)) candidates.push(...offers);
  else candidates.push(offers);

  for (const o of candidates) {
    const pRaw = o?.price ?? o?.lowPrice ?? o?.highPrice ?? o?.offers?.price;
    const p = parsePriceLike(
      typeof pRaw === "string" || typeof pRaw === "number" ? String(pRaw) : null
    );
    if (p) return p;
  }
  return null;
}

function extractFromLd(ld: any[]): { title?: string; image?: string; price?: number } {
  for (const node of ld) {
    const graph = node?.["@graph"] ? node["@graph"] : [node];
    for (const item of graph) {
      const type = item?.["@type"];
      const isProduct = type === "Product" || (Array.isArray(type) && type.includes("Product"));
      if (!isProduct) continue;

      const title = item?.name;

      let image: string | undefined;
      if (typeof item?.image === "string") image = item.image;
      else if (Array.isArray(item?.image) && item.image[0]) image = item.image[0];

      const p = normalizeOffersPrice(item?.offers);
      return { title, image, price: p ?? undefined };
    }
  }
  return {};
}

function tryParseNextDataPrice($: cheerio.CheerioAPI): number | null {
  // Next.js state çoğu zaman burada durur
  const txt = $("#__NEXT_DATA__").text()?.trim();
  if (!txt) return null;

  try {
    const j = JSON.parse(txt);

    // Çok farklı shape’ler olabiliyor. Bu yüzden “genel arama” yapıyoruz:
    // object içinde dolaşıp “price / sellingPrice / discountedPrice / salePrice” yakala.
    const keys = new Set(["price", "sellingPrice", "discountedPrice", "salePrice", "sale_price"]);
    const stack: any[] = [j];

    while (stack.length) {
      const cur = stack.pop();
      if (!cur || typeof cur !== "object") continue;

      for (const [k, v] of Object.entries(cur)) {
        if (keys.has(k)) {
          const p = parsePriceLike(typeof v === "string" || typeof v === "number" ? String(v) : null);
          if (p) return p;
        }
        if (v && typeof v === "object") stack.push(v);
      }
    }
  } catch {
    return null;
  }

  return null;
}

function tryRegexPriceFromHtml(html: string): number | null {
  // Son çare: HTML içinde price benzeri alanları regex ile yakala
  const patterns = [
    /"salePrice"\s*:\s*("?[\d.,]+"?)/i,
    /"sellingPrice"\s*:\s*("?[\d.,]+"?)/i,
    /"discountedPrice"\s*:\s*("?[\d.,]+"?)/i,
    /"price"\s*:\s*("?[\d.,]+"?)/i,
  ];

  for (const re of patterns) {
    const m = html.match(re);
    if (m && m[1]) {
      const raw = String(m[1]).replace(/"/g, "");
      const p = parsePriceLike(raw);
      if (p) return p;
    }
  }
  return null;
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

  const metaPriceRaw = pickMeta($, [
    'meta[property="product:price:amount"]',
    'meta[property="og:price:amount"]',
    'meta[name="price"]',
    'meta[itemprop="price"]',
  ]);
  const metaPrice = parsePriceLike(metaPriceRaw);

  const ld = parseJsonLd($);
  const fromLd = extractFromLd(ld);

  // DOM fallback (bazı sayfalarda yok çıkabiliyor)
  const domPriceText =
    $('[data-testid="price-current-price"]').first().text().trim() ||
    $("span.prc-dsc").first().text().trim() ||
    $("span.prc-slg").first().text().trim() ||
    $("span.prc-org").first().text().trim() ||
    "";

  const domPrice = parsePriceLike(domPriceText);

  // ✅ Next.js state fallback
  const nextPrice = tryParseNextDataPrice($);

  // ✅ Regex fallback
  const rxPrice = tryRegexPriceFromHtml(html);

  const price = fromLd.price ?? metaPrice ?? domPrice ?? nextPrice ?? rxPrice ?? null;
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
      domPriceText: domPriceText || null,
      nextPrice: nextPrice ?? null,
      rxPrice: rxPrice ?? null,
    },
  };
}
