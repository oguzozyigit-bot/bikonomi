// MVP-0 STUB — şimdilik her domain'e izin veriyoruz.
// analyze route'u URL tipini beklediği için normalizeUrl URL döndürür.

export function normalizeUrl(raw: string): URL {
  return new URL(raw);
}

export function isAllowed(_url: URL | string) {
  return true;
}
