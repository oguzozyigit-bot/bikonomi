// src/app/api/fetch/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";

type Source = "trendyol" | "hepsiburada" | "amazon" | "unknown";
type Currency = "TRY" | "USD" | "EUR" | null;

type FetchOut = {
  ok: boolean;
  url: string;
  source: Source;
  title: string | null;
  price: number | null;
  currency: Currency;
  rating: number | null;
  ratingCount: number | null;
  error?: string;
};

function json(out: FetchOut, status = 200) {
  return NextResponse.json(out, { status, headers: { "cache-control": "no-store" } });
}

function safeUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u;
  } catch {
    return null;
  }
}

function detectSource(u: URL): Source {
  const h = u.hostname.toLowerCase();
  if (h.includes("trendyol")) return "trendyol";
  if (h.includes("hepsiburada")) return "hepsiburada";
  if (h.includes("amazon")) return "amazon";
  return "unknown";
}

function stripTags(s: string) {
  return s.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function pickFirst(...vals: Array<string | undefined | null>) {
  for (const v of vals) if (v && v.trim()) return v.trim();
  return null;
}

function matchMeta(html: string, propOrName: string) {
  const re = new RegExp(
    `<meta[^>]+(?:property|name)=["']${propOrName}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i"
  );
  const m = html.match(re);
  return m?.[1] ? stripTags(m[1]) : null;
}

function matchTitleTag(html: string) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m?.[1] ? stripTags(m[1]) : null;
}

function parseNumberLike(s: string): number | null {
  if (!s) return null;
  let t = s.trim().replace(/[^\d.,]/g, "");
  if (!t) return null;

  const lastComma = t.lastIndexOf(",");
  const lastDot = t.lastIndexOf(".");

  if (lastComma > lastDot) t = t.replace(/\./g, "").replace(",", ".");
  else t = t.replace(/,/g, "");

  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

function detectCurrency(htmlOrText: string): Currency {
  const s = htmlOrText.toLowerCase();
  if (s.includes("₺") || s.includes("try") || /\btl\b/.test(s)) return "TRY";
  if (s.includes("$") || s.includes("usd")) return "USD";
  if (s.includes("€") || s.includes("eur")) return "EUR";
  return null;
}

function extractJsonLd(html: string): any[] {
  const out: any[] = [];
  const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const raw = (m[1] || "").trim();
    if (!raw) continue;
    try {
      out.push(JSON.parse(raw));
    } catch {}
  }
  return out;
}

function findProductNode(ld: any): any | null {
  if (!ld) return null;

  if (Array.isArray(ld)) {
    for (const x of ld) {
      const p = findProductNode(x);
      if (p) return p;
    }
    return null;
  }

  if (ld["@graph"] && Array.isArray(ld["@graph"])) {
    for (const x of ld["@graph"]) {
      const p = findProductNode(x);
      if (p) return p;
    }
  }

  const t = ld["@type"];
  if (t === "Product" || (Array.isArray(t) && t.includes("Product"))) return ld;

  return null;
}

function extractFromJsonLd(html: string) {
  const blocks = extractJsonLd(html);

  let title: string | null = null;
  let price: number | null = null;
  let currency: Currency = null;
  let rating: number | null = null;
  let ratingCount: number | null = null;

  for (const b of blocks) {
    const product = findProductNode(b);
    if (!product) continue;

    title = title ?? (typeof product.name === "string" ? product.name : null);

    const offers = product.offers;
    const offerObj = Array.isArray(offers) ? offers[0] : offers;

    if (offerObj && typeof offerObj === "object") {
      const pRaw = offerObj.price ?? offerObj.lowPrice ?? offerObj.highPrice;
      if (pRaw != null) price = price ?? parseNumberLike(String(pRaw));

      const cRaw = offerObj.priceCurrency;
      if (cRaw && typeof cRaw === "string") {
        const c = cRaw.toUpperCase();
        if (c === "TRY") currency = "TRY";
        if (c === "USD") currency = "USD";
        if (c === "EUR") currency = "EUR";
      }
    }

    const ar = product.aggregateRating;
    if (ar && typeof ar === "object") {
      if (ar.ratingValue != null) rating = rating ?? parseNumberLike(String(ar.ratingValue));
      const rc = ar.ratingCount ?? ar.reviewCount;
      if (rc != null) ratingCount = ratingCount ?? parseNumberLike(String(rc));
    }

    break;
  }

  return { title, price, currency, rating, ratingCount };
}

function extractFromHtmlHeuristics(html: string) {
  const title = pickFirst(
    matchMeta(html, "og:title"),
    matchMeta(html, "twitter:title"),
    matchMeta(html, "title"),
    matchTitleTag(html)
  );

  const metaPriceStr = pickFirst(
    matchMeta(html, "product:price:amount"),
    matchMeta(html, "og:price:amount"),
    matchMeta(html, "price"),
    (() => {
      const m = html.match(/itemprop=["']price["'][^>]*content=["']([^"']+)["']/i);
      return m?.[1] ?? null;
    })()
  );

  // ✅ Genişletilmiş: ₺ + TL + TRY varyasyonları (kuruşlu/kuruşsuz)
  const visiblePrice =
    // 12.345,67 ₺
    html.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*₺/i)?.[1] ??
    html.match(/₺\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/i)?.[1] ??
    // 12.345,67 TL
    html.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*TL\b/i)?.[1] ??
    html.match(/\bTL\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/i)?.[1] ??
    // 12.345 TL (kuruşsuz)
    html.match(/(\d{1,3}(?:\.\d{3})*)\s*TL\b/i)?.[1] ??
    // 12.345,67 TRY / 12.345 TRY
    html.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*TRY\b/i)?.[1] ??
    html.match(/(\d{1,3}(?:\.\d{3})*)\s*TRY\b/i)?.[1] ??
    null;

  const finalPriceStr = metaPriceStr ?? visiblePrice;

  const price = finalPriceStr ? parseNumberLike(finalPriceStr) : null;
  const currency = detectCurrency(finalPriceStr || html);

  const rv =
    html.match(/"ratingValue"\s*:\s*"?(?<v>\d+(?:[.,]\d+)?)"?/i)?.groups?.v ??
    html.match(/ratingValue["']?\s*content=["'](?<v>\d+(?:[.,]\d+)?)["']/i)?.groups?.v ??
    null;

  const rating = rv ? parseNumberLike(rv) : null;

  const rc = html.match(/"(ratingCount|reviewCount)"\s*:\s*"?(?<n>\d{1,9})"?/i)?.groups?.n ?? null;
  const ratingCount = rc ? parseNumberLike(rc) : null;

  return { title, price, currency, rating, ratingCount };
}

// ✅ Trendyol state: numeric + string fiyat alanları (daha geniş)
function extractTrendyolPriceFromState(html: string): number | null {
  const candidates: number[] = [];

  // 1) Numeric alanlar
  const reNum =
    /"(salePrice|sellingPrice|price|discountedPrice|originalPrice|buyingPrice|marketPrice)"\s*:\s*(\d+(?:\.\d+)?)/gi;

  let m: RegExpExecArray | null;
  while ((m = reNum.exec(html))) {
    let n = Number(m[2]);
    if (!Number.isFinite(n)) continue;

    // kuruş (x100) ihtimali
    if (n >= 1000000) n = n / 100;

    if (n > 1 && n < 500000) candidates.push(n);
    if (candidates.length >= 60) break;
  }

  // 2) String fiyatlar: "12.345,67 TL" vb.
  const reStr =
    /"(priceText|formattedPrice|displayPrice|priceFormatted|salePriceText)"\s*:\s*"([^"]{1,40})"/gi;

  while ((m = reStr.exec(html))) {
    const s = m[2];
    if (!s) continue;

    if (/(₺|\bTL\b|\bTRY\b)/i.test(s)) {
      const n = parseNumberLike(s);
      if (n && n > 1 && n < 500000) candidates.push(n);
    }

    if (candidates.length >= 80) break;
  }

  if (!candidates.length) return null;

  candidates.sort((a, b) => a - b);
  return candidates[0];
}

async function fetchHtmlDirect(targetUrl: string) {
  return fetch(targetUrl, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "tr-TR,tr;q=0.9,en;q=0.8",
    },
    cache: "no-store",
    redirect: "follow",
  });
}

async function fetchHtmlViaScraperApi(targetUrl: string) {
  const key = process.env.SCRAPERAPI_KEY;
  if (!key) throw new Error("SCRAPERAPI_KEY missing");

  const apiUrl =
    `https://api.scraperapi.com?api_key=${encodeURIComponent(key)}` +
    `&url=${encodeURIComponent(targetUrl)}` +
    `&country_code=tr` +
    `&render=true`;

  return fetch(apiUrl, { cache: "no-store" });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("url") || "").trim();

  const u = safeUrl(raw);
  if (!u) {
    return json(
      {
        ok: false,
        url: raw || "",
        source: "unknown",
        title: null,
        price: null,
        currency: null,
        rating: null,
        ratingCount: null,
        error: "Geçersiz URL",
      },
      400
    );
  }

  const source = detectSource(u);

  let html = "";
  let lastHttpStatus: number | null = null;

  try {
    // 1) Önce direkt dene (ucuz)
    let res = await fetchHtmlDirect(u.toString());
    lastHttpStatus = res.status;

    // ✅ 2xx değilse ScraperAPI’ye düş (410/404/403/429...)
    if (!res.ok) {
      res = await fetchHtmlViaScraperApi(u.toString());
      lastHttpStatus = res.status;
    }

    if (!res.ok) {
      return json({
        ok: false,
        url: u.toString(),
        source,
        title: null,
        price: null,
        currency: null,
        rating: null,
        ratingCount: null,
        error: `HTTP ${res.status}`,
      });
    }

    html = await res.text();
  } catch (e: any) {
    return json({
      ok: false,
      url: u.toString(),
      source,
      title: null,
      price: null,
      currency: null,
      rating: null,
      ratingCount: null,
      error: e?.message || "Fetch başarısız",
    });
  }

  const fromLd = extractFromJsonLd(html);
  const fromHtml = extractFromHtmlHeuristics(html);

  const title = fromLd.title ?? fromHtml.title ?? null;

  const price =
    fromLd.price ??
    fromHtml.price ??
    (source === "trendyol" ? extractTrendyolPriceFromState(html) : null) ??
    null;

  const currency: Currency =
    fromLd.currency ?? (fromHtml.currency as Currency) ?? (price != null ? "TRY" : null);

  const rating = fromLd.rating ?? fromHtml.rating ?? null;
  const ratingCount = fromLd.ratingCount ?? fromHtml.ratingCount ?? null;

  const ok = Boolean(title || price || rating || ratingCount);

  return json({
    ok,
    url: u.toString(),
    source,
    title,
    price,
    currency,
    rating,
    ratingCount,
    ...(ok ? {} : { error: `Veri çıkarılamadı (HTTP ${lastHttpStatus ?? "?"})` }),
  });
}
