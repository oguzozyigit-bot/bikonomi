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

export async function fetchTrendyol(u: URL): Promise<FetchedProduct> {
  const url = u.toString();
  const r = await fetchHtml(url);

  if (!r.ok) {
    throw new Error(
      `TRENDYOL_HTTP_${r.status} ${r.statusText} ${r.blockedHint ?? ""}`.trim()
    );
  }

  const $ = cheerio.load(r.html);

  const fallbackTitle =
    pickFirst(
      $('meta[property="og:title"]').attr("content"),
      $("title").text()
    ) || "Trendyol ürün";

  // 1) JSON-LD dene (array olabilir)
  const ldText = $('script[type="application/ld+json"]').first().text()?.trim();
  if (ldText) {
    try {
      const parsed = JSON.parse(ldText);
      const j = Array.isArray(parsed) ? parsed[0] : parsed;
      const offers = Array.isArray(j?.offers) ? j.offers[0] : j?.offers;

      const title = pickFirst(j?.name, fallbackTitle);
      const price = toNumber(offers?.price);
      const currency = offers?.priceCurrency ?? "TRY";
      const rating = toNumber(j?.aggregateRating?.ratingValue);
      const ratingCount = (() => {
        const rc = toNumber(j?.aggregateRating?.ratingCount);
        return rc == null ? null : Math.trunc(rc);
      })();

      return {
        source: "trendyol",
        url,
        title,
        price,
        currency,
        rating,
        ratingCount,
      };
    } catch {
      // fallback aşağıya
    }
  }

  // 2) DOM fallback (bazı sayfalarda meta ile gelir)
  const metaPrice =
    $('meta[property="product:price:amount"]').attr("content")?.trim() ||
    $('meta[itemprop="price"]').attr("content")?.trim();

  const metaCurrency =
    $('meta[property="product:price:currency"]').attr("content")?.trim() ||
    $('meta[itemprop="priceCurrency"]').attr("content")?.trim();

  return {
    source: "trendyol",
    url,
    title: fallbackTitle,
    price: metaPrice ? toNumber(metaPrice) : null,
    currency: metaCurrency || "TRY",
    rating: null,
    ratingCount: null,
  };
}
