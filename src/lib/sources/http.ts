export type FetchHtmlResult = {
  ok: boolean;
  status: number;
  statusText: string;
  url: string;
  html: string;
  blockedHint?: string;
};

function mustEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function buildScraperApiUrl(targetUrl: string) {
  const apiKey = mustEnv("SCRAPER_API_KEY");
  const u = new URL(targetUrl);
  const host = u.hostname.replace(/^www\./, "");

  const params: Record<string, string> = {
    api_key: apiKey,
    url: targetUrl,
    country_code: "tr",
    premium: "true",
    render: "true",
    keep_headers: "true",
  };

  // Hepsiburada biraz ağır: basit selector bekletme
  if (host.endsWith("hepsiburada.com")) {
    params.wait_for_selector =
      'script#__NEXT_DATA__, [data-test-id="price-current-price"], meta[property="product:price:amount"]';
  }

  return "https://api.scraperapi.com/?" + new URLSearchParams(params).toString();
}

async function fetchOnce(proxyUrl: string) {
  const res = await fetch(proxyUrl, { redirect: "follow" });
  const status = res.status;
  const statusText = res.statusText;

  let html = "";
  try {
    html = await res.text();
  } catch {
    html = "";
  }

  const blockedHint =
    status === 403 || status === 429
      ? "Rate limit / bot koruması (403/429)"
      : undefined;

  return { ok: res.ok, status, statusText, html, blockedHint };
}

export async function fetchHtml(url: string): Promise<FetchHtmlResult> {
  const proxyUrl = buildScraperApiUrl(url);

  // Proxy bazen 500 döner: retry
  const retryStatuses = new Set([500, 502, 503, 504]);
  const maxTries = 3;

  let last: any = null;

  for (let i = 1; i <= maxTries; i++) {
    last = await fetchOnce(proxyUrl);

    // başarılı
    if (last.ok) {
      return {
        ok: true,
        status: last.status,
        statusText: last.statusText,
        url,
        html: last.html,
        blockedHint: last.blockedHint,
      };
    }

    // engel: retry gereksiz
    if (last.status === 403 || last.status === 429) {
      return {
        ok: false,
        status: last.status,
        statusText: last.statusText,
        url,
        html: last.html,
        blockedHint: last.blockedHint,
      };
    }

    // geçici hata: retry
    if (retryStatuses.has(last.status) && i < maxTries) {
      await sleep(600 * i);
      continue;
    }

    // diğer hatalar
    return {
      ok: false,
      status: last.status,
      statusText: last.statusText,
      url,
      html: last.html,
      blockedHint: last.blockedHint,
    };
  }

  return {
    ok: false,
    status: last?.status ?? 500,
    statusText: last?.statusText ?? "Unknown",
    url,
    html: last?.html ?? "",
    blockedHint: last?.blockedHint,
  };
}
