import * as cheerio from "cheerio";
import type { FetchedProduct } from "./types";
import { fetchHtml } from "./http";

function pick(...vals: Array<string | undefined | null>) {
  for (const v of vals) if (v && v.trim()) return v.trim();
  return "";
}
function toNumber(x: any): number | null {
  if (x == null) return null;
  const s = String(x).trim().replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function fetchTrendyol(u: URL): Promise<FetchedProduct> {
  const r = await fetchHtml(u.toString());

  if (!r.ok) {
    // Burada net göreceğiz: 403 mü, 429 mu?
    throw new Error(`TRENDYOL_HTTP_${r.status} ${r.statusText} ${r.blockedHint ?? ""}`.trim());
  }

  const $ = cheerio.load(r.html);

  const fallbackTitle = pick(
    $('meta[property="og:title"]').attr("content"),
    $("title").text()
  ) || "Trendyol ürün";

  const ldText = $('script[type="application/ld+json"]').first().text()?.trim();
  if (ldText) {
    try {
      const parsed = JSON.parse(ldText);
      const j = Array.isArray(parsed) ? parsed[0] : parsed;
      const offers = Array.isArray(j?.offers) ? j.offers[0] : j?.offers;

      return {
        source: "trendyol",
        url: u.toString(),
        title: pick(j?.name, fallbackTitle) || fallbackTitle,
        price: toNumber(offers?.price),
        currency: offers?.priceCurrency ?? "TRY",
        rating: toNumber(j?.aggregateRating?.ratingValue),
        ratingCount: (() => {
          const rc = toNumber(j?.aggregateRating?.ratingCount);
          return rc == null ? null : Math.trunc(rc);
        })(),
      };
    } catch {
      // parse edemediysek fallback
    }
  }

  return {
    source: "trendyol",
    url: u.toString(),
    title: fallbackTitle,
    price: null,
    currency: "TRY",
    rating: null,
    ratingCount: null,
  };
}
