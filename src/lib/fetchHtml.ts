import { Source } from "@/lib/types";

function buildProxyUrl(target: string) {
  const key = process.env.SCRAPER_PROVIDER_KEY;
  if (!key) return null;

  // Basit proxy şablonu (servis sağlayıcına göre değiştirebilirsin)
  // Örn: ScraperAPI:
  // https://api.scraperapi.com?api_key=KEY&url=ENCODED
  return `https://api.scraperapi.com?api_key=${encodeURIComponent(key)}&url=${encodeURIComponent(target)}`;
}

export async function fetchHtml(url: string, _source: Source) {
  const proxy = buildProxyUrl(url);
  const target = proxy ?? url;

  const res = await fetch(target, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      "accept":
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
      "cache-control": "no-cache",
      pragma: "no-cache",
    },
    redirect: "follow",
  });

  if (!res.ok) throw new Error(`fetchHtml failed: ${res.status}`);
  return await res.text();
}
