export type FetchHtmlResult = {
  ok: boolean;
  status: number;
  statusText: string;
  url: string;
  html: string;
  blockedHint?: string;
};

export async function fetchHtml(url: string): Promise<FetchHtmlResult> {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
      "cache-control": "no-cache",
      pragma: "no-cache",
      // bazı siteler gzip/br ile farklı davranabiliyor
      "accept-encoding": "gzip, deflate, br",
    },
    redirect: "follow",
  });

  const finalUrl = res.url || url;
  const status = res.status;
  const statusText = res.statusText;

  let html = "";
  try {
    html = await res.text();
  } catch {
    html = "";
  }

  // Basit “engellendim” ipuçları
  const lower = html.toLowerCase();
  const blockedHint =
    status === 403 || status === 429
      ? "Rate limit / bot koruması (403/429)"
      : lower.includes("captcha") || lower.includes("robot") || lower.includes("doğrula")
      ? "CAPTCHA / bot doğrulama"
      : undefined;

  return {
    ok: res.ok,
    status,
    statusText,
    url: finalUrl,
    html,
    blockedHint,
  };
}
