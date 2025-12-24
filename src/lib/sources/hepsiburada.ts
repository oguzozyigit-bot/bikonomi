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
  for (const v of vals) {
    if (v && v.trim()) return v.trim();
  }
  return "";
}

export async function fetchHepsiburada(u: URL): Promise<FetchedProduct> {
  const url = u.toString();

  // 🔴 KRİTİK: fetch sonucu kontrol ediliyor
  const r = await fetchHtml(url);

  if (!r.ok) {
    // Burası SADECE debug için, UI’a gerçek sebebi taşır
    throw new Error(
      `HB_HTTP_${r.status} ${r.statusText} ${r.blockedHint ?? ""}`.trim()
    );
  }

  const $ = cheerio.load(r.html);

  // Fallback başlık (her durumda bir şey dönsün)
  const fallbackTitle =
    pickFirst(
      $('meta[property="og:title"]').attr("content"),
      $("title").text()
    ) || "Hepsiburada ürün";

  // 1) JSON-LD dene
  const ldText = $('script[type="application/ld+json"]').first().text()?.trim();

  if (ldText) {
    try {
      const parsed = JSON.parse(ldText);
      const j = Array.isArray(parsed) ? parsed[0] : parsed;

      const offers = Array.isArray(j?.offers) ? j.offers[0] : j?.offers;

      return {
        source: "hepsiburada",
        url,
        title: pickFirst(j?.name, fallbackTitle),
        price: toNumber(offers?.price),
        currency: offers?.priceCurrency ?? "TRY",
        rating: toNumber(j?.aggregateRating?.ratingValue),
        ratingCount: (() => {
          const rc = toNumber(j?.aggregateRating?.ratingCount);
          return rc == null ? null : Math.trunc(rc);
        })(),
      };
    } catch (e) {
      // JSON parse edilemezse fallback'e düşer
      console.error("HB JSON-LD parse error", e);
    }
  }

  // 2) JSON-LD yoksa minimum veri
  return {
    source: "hepsiburada",
    url,
    title: fallbackTitle,
    price: null,
    currency: "TRY",
    rating: null,
    ratingCount: null,
  };
}
