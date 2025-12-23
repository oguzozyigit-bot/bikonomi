import { NormalizedProduct } from "@/lib/normalize";

function pickTrendyolId(url: string) {
  // Trendyol URL'lerinde genelde -p-123456 veya benzeri geçer
  const m = url.match(/-p-(\d+)/i);
  return m?.[1];
}

export async function normalizeTrendyol(url: string): Promise<NormalizedProduct> {
  const sourceProductId = pickTrendyolId(url);

  // “Gerçek veri” denemesi: sayfayı çekip title yakalama (garanti değil)
  let title = "Trendyol Ürünü";
  try {
    const res = await fetch(url, { cache: "no-store" });
    const html = await res.text();
    const t = html.match(/<title>(.*?)<\/title>/i)?.[1];
    if (t) title = t.replace(/\s+/g, " ").trim();
  } catch {}

  // Bugün offer listesini şimdilik boş bırakabiliriz
  // Yarın: sayfadaki JSON state / script tag içinden fiyat-satıcı çekimi ekleriz
  return {
    source: "trendyol",
    sourceProductId,
    url,
    title,
    currency: "TRY",
    offers: [],
  };
}
