// lib/allowedDomains.ts
export const ALLOWED_DOMAINS = [
  "www.trendyol.com",
  "trendyol.com",
  "www.hepsiburada.com",
  "hepsiburada.com",
  "www.n11.com",
  "n11.com",
  "www.amazon.com.tr",
  "amazon.com.tr",
] as const;

export function normalizeUrl(input: string) {
  const trimmed = (input || "").trim();
  if (!trimmed) throw new Error("empty");
  const url = new URL(trimmed);
  return url;
}

export function isAllowed(url: URL) {
  const host = url.hostname.toLowerCase();
  return ALLOWED_DOMAINS.includes(host as any);
}
