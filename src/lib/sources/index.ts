import type { FetchedProduct } from "./types";
import { fetchTrendyol } from "./trendyol";
import { fetchHepsiburada } from "./hepsiburada";
import { fetchAmazon } from "./amazon";

export function detectSource(u: URL): FetchedProduct["source"] {
  const h = u.hostname.replace(/^www\./, "");
  if (h.includes("trendyol")) return "trendyol";
  if (h.includes("hepsiburada")) return "hepsiburada";
  if (h.includes("amazon")) return "amazon";
  return "unknown";
}

export async function fetchByUrl(url: string): Promise<FetchedProduct> {
  const u = new URL(url);
  const source = detectSource(u);

  if (source === "amazon") return fetchAmazon(u);
  if (source === "trendyol") return fetchTrendyol(u);
  if (source === "hepsiburada") return fetchHepsiburada(u);

  return {
    source,
    url: u.toString(),
    title: "Desteklenmeyen kaynak",
    price: null,
    currency: "TRY",
    rating: null,
    ratingCount: null,
  };
}
