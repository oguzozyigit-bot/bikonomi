import { Source } from "@/lib/types";
import { fetchHtml } from "@/lib/fetchHtml";

const FALLBACK_IMAGE =
  "https://dummyimage.com/600x600/111827/ffffff&text=Bikonomi";

function cleanTitle(t: string) {
  let s = (t || "").replace(/\s+/g, " ").trim();

  // site son eklerini temizle
  s = s.replace(/\s*[\|\-:]\s*(Trendyol|Hepsiburada|Amazon\.com\.tr|Amazon)\s*$/i, "").trim();

  if (s.length > 120) s = s.slice(0, 117).trim() + "…";
  if (!s) s = "Ürün";
  return s;
}

function absUrl(maybe: string, base: string) {
  try {
    return new URL(maybe, base).toString();
  } catch {
    return maybe;
  }
}

export async function buildProductMeta(url: string, source: Source) {
  try {
    const html = await fetchHtml(url, source);
    const cheerio = await import("cheerio");
    const $ = cheerio.load(html);

    const ogTitle =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").text();

    const ogImage =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      $('meta[property="og:image:secure_url"]').attr("content") ||
      "";

    const title = cleanTitle(ogTitle || "");
    const image = ogImage ? absUrl(ogImage, url) : FALLBACK_IMAGE;

    return { title, image };
  } catch {
    // fail-soft
    const slug = (() => {
      try {
        const u = new URL(url);
        const last = u.pathname.split("/").filter(Boolean).pop() || "";
        const s = decodeURIComponent(last)
          .replace(/[-_]+/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        return s ? cleanTitle(s) : "Ürün";
      } catch {
        return "Ürün";
      }
    })();

    return { title: slug, image: FALLBACK_IMAGE };
  }
}
