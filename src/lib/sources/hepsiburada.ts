import * as cheerio from "cheerio";
import type { FetchedProduct } from "./types";
import { fetchHtml } from "./http";

function toNumber(x: any): number | null {
  if (x == null) return null;
  const s = String(x).replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export async function fetchHepsiburada(u: URL): Promise<FetchedProduct> {
  // Önce gerçek dene
  try {
    const html = await fetchHtml(u.toString());
    const $ = cheerio.load(html);

    const ldJson = $('script[type="application/ld+json"]').first().text()?.trim();
    if (ldJson) {
      const j = JSON.parse(ldJson);
      const title = j?.name ?? $("title").text().trim();
      const rating = toNumber(j?.aggregateRating?.ratingValue);
      const ratingCount = toNumber(j?.aggregateRating?.ratingCount);
      const price = toNumber(j?.offers?.price);
      const currency = j?.offers?.priceCurrency ?? "TRY";

      return {
        source: "hepsiburada",
        url: u.toString(),
        title,
        price,
        currency,
        rating,
        ratingCount: ratingCount == null ? null : Math.trunc(ratingCount),
      };
    }
  } catch {
    // yut, mock'a düş
  }

  // Mock fallback (senin mevcut mock’unu buraya taşı)
  return {
    source: "hepsiburada",
    url: u.toString(),
    title: "Hepsiburada (mock fallback)",
    price: null,
    currency: "TRY",
    rating: null,
    ratingCount: null,
  };
}
