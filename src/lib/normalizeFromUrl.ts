import { fetchByUrl } from "@/lib/sources";

/**
 * Eski normalize* fonksiyonlarını kaldırdık.
 * Artık tek giriş noktası: fetchByUrl(url)
 * - kaynağı tespit eder
 * - uygun parser'ı çağırır (hepsiburada/trendyol/amazon)
 */
export async function normalizeFromUrl(rawUrl: string) {
  const url = rawUrl.trim();
  if (!url) throw new Error("URL boş");

  // URL doğrulama
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    throw new Error("Geçersiz URL");
  }

  return fetchByUrl(u.toString());
}
