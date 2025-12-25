import { fetchBySource } from "@/lib/sources";

/**
 * URL'yi normalize eder ve kaynak (trendyol/hepsiburada) tespit edip fetch eder.
 * Not: Hepsiburada server-side 403 dönebilir; bu yine de tip hatası yaratmaz.
 */
export async function normalizeFromUrl(rawUrl: string) {
  const urlStr = (rawUrl ?? "").trim();
  if (!urlStr) throw new Error("URL boş");

  let u: URL;
  try {
    u = new URL(urlStr);
  } catch {
    throw new Error("Geçersiz URL");
  }

  const host = u.hostname.replace(/^www\./, "").toLowerCase();

  let source: "trendyol" | "hepsiburada";
  if (host.includes("trendyol.com")) source = "trendyol";
  else if (host.includes("hepsiburada.com")) source = "hepsiburada";
  else throw new Error("Desteklenmeyen kaynak");

  // ✅ Artık source tanımlı, TS hatası biter
  return fetchBySource(source, u.toString());
}
