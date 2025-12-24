import * as cheerio from "cheerio";
import type { FetchedProduct } from "./types";
import { fetchHtml } from "./http";

function toNumber(x: any): number | null {
  if (x == null) return null;
  // "1.299,90" -> "1299.90"
  const s = String(x).trim().replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function pickFirstNonEmpty(...vals: Array<string | undefined | null>): string {
  for (const v of vals) {
    if (v && v.trim()) return v.trim();
  }
  return "";
}

export async function fetchTrendyol(u: URL): Promise<FetchedProduct> {
  const url = u.toString();
  const html = await fetchHtml(url);
  const $ = cheerio.load(html);

  // Fallback title (her durumda bir şey dönsün)
  const fallbackTitle = pickFirstNonEmpty(
    $('meta[property="og:title"]').attr("content"),
    $("title").text()
  ) || "Trendyol ürün";

  // 1) JSON-LD: script[type="application/ld+json"] (array veya object olabilir)
  const ldText = $('script[type="application/ld+json"]').first().text()?.trim();

  if (ldText) {
    try {
      const parsed = JSON.parse(ldText);
      const j = Array.isArray(parsed) ? parsed[0] : parsed;

      const title = pickFirstNonEmpty(j?.name, fallbackTitle);

      // offers bazen object, bazen array olabiliyor
      const offers = Array.isArray(j?.offers) ? j.offers[0] : j?.offers;

      const price = toNumber(offers?.price);
      const currency = offers?.priceCurrency ?? "TRY";

      const rating = toNumber(j?.aggregateRating?.ratingValue);
      const ratingCount = toNumber(j?.aggregateRating?.ratingCount);

      return {
        source: "trendyol",
        url,
        title,
        price,
        currency,
        rating,
        ratingCount: ratingCount == null ? null : Math.trunc(ratingCount),
      };
    } catch (e) {
      // JSON-LD bazen bozuk/çoklu olabiliyor; fallback'e düşer
      console.error("Trendyol JSON-LD parse error:", e);
    }
  }

  // 2) JSON-LD yoksa: en azından title dön
  return {
    source: "trendyol",
    url,
    title: fallbackTitle,
    price: null,
    currency: "TRY",
    rating: null,
    ratingCount: null,
  };
}
