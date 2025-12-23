import { NormalizedProduct } from "@/lib/normalize";
import { normalizeTrendyol } from "@/lib/sources/trendyol";

export async function normalizeFromUrl(url: string): Promise<NormalizedProduct> {
  const u = url.toLowerCase();
  if (u.includes("trendyol.com")) return normalizeTrendyol(url);

  // fallback (gerçek veri yoksa bile pipeline çalışsın)
  return {
    source: "unknown",
    url,
    title: "Bulunamadı / Geçici",
    currency: "TRY",
    offers: [],
  };
}
