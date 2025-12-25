/**
 * URL string -> URL objesi (temizlenmiş)
 * Not: Bu dosya sadece URL parse + normalize yapar, fetch yapmaz.
 */

export function normalizeUrl(raw: string): URL {
  const s = (raw ?? "").trim();
  if (!s) throw new Error("URL boş");

  // Bazı kullanıcılar "www..." veya "trendyol.com/..." diye yapıştırabilir.
  // Protokol yoksa https ekleyelim.
  const withProto = /^https?:\/\//i.test(s) ? s : `https://${s}`;

  let u: URL;
  try {
    u = new URL(withProto);
  } catch {
    throw new Error("Geçersiz URL");
  }

  // www kaldır
  u.hostname = u.hostname.replace(/^www\./i, "").toLowerCase();

  // sadece http/https
  if (u.protocol !== "https:" && u.protocol !== "http:") {
    throw new Error("Geçersiz protokol");
  }

  return u;
}
