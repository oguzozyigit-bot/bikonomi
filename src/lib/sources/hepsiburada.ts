import * as cheerio from "cheerio";
import type { FetchedProduct } from "./types";
import { fetchHtml } from "./http";

function toNumber(x: any): number | null {
  if (x == null) return null;
  const s = String(x).trim().replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function pickFirst(...vals: Array<string | undefined | null>): string {
  for (const v of vals) if (v && v.trim()) return v.trim();
  return "";
}

// Deep JSON içinde fiyat arar
function findPriceDeep(obj: any): number | null {
  const seen = new Set<any>();
  const keys = new Set([
    "price",
    "currentprice",
    "saleprice",
    "discountedprice",
    "finalprice",
    "amount",
    "value",
    "listingprice",
    "buyboxprice",
  ]);

  const stack: any[] = [obj];

  while (stack.length) {
    const cur = stack.pop();
    if (!cur || typeof cur !== "object") continue;
    if (seen.has(cur)) continue;
    seen.add(cur);

    if (Array.isArray(cur)) {
      for (const it of cur) stack.push(it);
      continue;
    }

    for (const [k, v] of Object.entries(cur)) {
      const kk = k.toLowerCase();

      if (keys.has(kk)) {
        const n = toNumber(v);
        if (n != null && n > 0 && n < 1_000_000) return n;

        if (v && typeof v === "object") {
          const n2 =
            toNumber((v as any).amount) ??
            toNumber((v as any).value) ??
            toNumber((v as any).price);
          if (n2 != null && n2 > 0 && n2 < 1_000_000) return n2;
        }
      }

      if (v && typeof v === "object") stack.push(v);
    }
  }

  return null;
}

export async function fetchHepsiburada(u: URL): Promise<FetchedProduct> {
  const url = u.toString();
  const r = await fetchHtml(url);

  if (!r.ok) {
    throw new Error(
      `HB_HTTP_${r.status} ${r.statusText} ${r.blockedHint ?? ""}`.trim()
    );
  }

  const $ = cheerio.load(r.html);

  const fallbackTitle =
    pickFirst(
      $('meta[property="og:title"]').attr("content"),
      $("title").text()
    ) || "Hepsiburada ürün";

  // DOM fiyat denemeleri
  const domPriceText =
    $('[data-test-id="price-current-price"]').first().text().trim() ||
    $('[data-test-id="price-value"]').first().text().trim() ||
    $('[itemprop="price"]').attr("content")?.trim() ||
    $('meta[itemprop="price"]').attr("content")?.trim() ||
    $('meta[property="product:price:amount"]').attr("content")?.trim();

  const domPrice = domPriceText ? toNumber(domPriceText) : null;

  // JSON-LD denemeleri
  let jsonLdPrice: number | null = null;
  let jsonLdCurrency: string | null = null;
  let jsonLdTitle: string | null = null;

  const scripts = $('script[type="application/ld+json"]').toArray();
  for (const s of scripts) {
    const raw = $(s).text()?.trim();
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      const arr = Array.isArray(parsed) ? parsed : [parsed];

      for (const j of arr) {
        const type = String(j?.["@type"] ?? "").toLowerCase();
        if (type && !type.includes("product")) continue;

        jsonLdTitle = jsonLdTitle ?? (j?.name ? String(j.name) : null);

        const offers = Array.isArray(j?.offers) ? j.offers[0] : j?.offers;
        const p1 = toNumber(offers?.price);
        const p2 = toNumber(offers?.priceSpecification?.price);
        const p = p1 ?? p2;
        if (p != null) jsonLdPrice = jsonLdPrice ?? p;

        const cur =
          offers?.priceCurrency ?? offers?.priceSpecification?.priceCurrency;
        if (cur) jsonLdCurrency = jsonLdCurrency ?? String(cur);
      }
    } catch {
      // ignore
    }
  }

  // NEXT_DATA / state içinden fiyat denemesi
  let statePrice: number | null = null;
  const nextData = $("script#__NEXT_DATA__").first().text()?.trim();
  if (nextData) {
    try {
      const j = JSON.parse(nextData);
      statePrice =
        findPriceDeep(j?.props) ??
        findPriceDeep(j?.pageProps) ??
        findPriceDeep(j);
    } catch {
      // ignore
    }
  }

  // Regex fallback (çok kaba)
  if (statePrice == null) {
    const m = r.html.match(/"price"\s*:\s*([0-9]+(?:\.[0-9]+)?)/i);
    if (m?.[1]) {
      const n = toNumber(m[1]);
      if (n != null && n > 0 && n < 1_000_000) statePrice = n;
    }
  }

  const price = jsonLdPrice ?? domPrice ?? statePrice;

  return {
    source: "hepsiburada",
    url,
    title: pickFirst(jsonLdTitle, fallbackTitle),
    price,
    currency: jsonLdCurrency ?? "TRY",
    rating: null,
    ratingCount: null,
  };
}
