// src/lib/normalizeUrl.ts
// MVP-0/8: Normalize + allow gate.
// Şimdilik her domain'e izin var (isAllowed true).
// Sonradan burayı domain listesine çevireceğiz.

export function normalizeUrl(raw: string): URL {
  const s = (raw ?? "").trim();
  if (!s) throw new Error("empty");

  // Kullanıcı "hepsiburada.com/..." yazarsa diye
  const withProto = s.startsWith("http://") || s.startsWith("https://") ? s : `https://${s}`;

  return new URL(withProto);
}

export function isAllowed(_url: URL | string) {
  return true; // MVP: herkes geçsin
}

export function detectSource(u: URL) {
  const host = u.hostname.replace(/^www\./, "").toLowerCase();
  if (host.endsWith("hepsiburada.com")) return "hepsiburada";
  if (host.endsWith("amazon.com") || host.endsWith("amazon.com.tr")) return "amazon";
  return "unknown";
}
