import { Source, Offer } from "@/lib/types";
import { fetchHtml } from "@/lib/fetchHtml";

/** "1.299,90 TL" -> 1299.90 */
function parseNumberLike(s: string) {
  if (!s) return null;
  const cleaned = s
    .replace(/\s/g, "")
    .replace(/[^\d.,]/g, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "") // binlik ayırıcı noktaları kaldır
    .replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** script[type=application/ld+json] içeriklerini çıkarır */
function extractJsonLdBlocks(html: string): any[] {
  const blocks: any[] = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const raw = (m[1] || "").trim();
    if (!raw) continue;
    try {
      blocks.push(JSON.parse(raw));
    } catch {
      // bazı siteler bozuk jsonld gömebilir; ignore
    }
  }
  return blocks;
}

/** JSON-LD'den price/availability çekmeye çalışır */
function findFromJsonLd(jsons: any[]): { price: number; availability?: string } | null {
  for (const j of jsons) {
    const arr = Array.isArray(j) ? j : [j];
    for (const node of arr) {
      // Product bazen @graph içinde olur
      const graph = node?.["@graph"];
      const nodes = graph ? (Array.isArray(graph) ? graph : [graph]) : [node];

      for (const n of nodes) {
        const offers = n?.offers;
        const offerArr = offers ? (Array.isArray(offers) ? offers : [offers]) : [];
        for (const o of offerArr) {
          const p = o?.price ?? o?.priceSpecification?.price;
          const price =
            typeof p === "number" ? p : typeof p === "string" ? parseNumberLike(p) : null;
          if (price && price > 0) {
            return {
              price,
              availability: o?.availability,
            };
          }
        }
      }
    }
  }
  return null;
}

function trustFromSource(source: Source): 0 | 1 | 2 {
  if (source === "Trendyol" || source === "Hepsiburada" || source === "Amazon") return 2;
  return 1;
}

function inStockFromAvailability(av?: string) {
  if (!av) return true;
  const a = av.toLowerCase();
  if (a.includes("outofstock")) return false;
  if (a.includes("instock")) return true;
  return true;
}

/** meta tag content */
function metaContent(html: string, patterns: RegExp[]) {
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) return m[1];
  }
  return null;
}

/** Hedefli regex ile fiyat yakalama (kaynak bazlı) */
function priceFallbackBySource(html: string, source: Source): number | null {
  const h = html;

  const tryMany = (res: RegExp[]) => {
    for (const re of res) {
      const m = h.match(re);
      const v = m?.[1] ? parseNumberLike(m[1]) : null;
      if (v && v > 0) return v;
    }
    return null;
  };

  if (source === "Trendyol") {
    // Trendyol sayfalarında sık görülen price pattern’ler
    return tryMany([
      /"price"\s*:\s*"([^"]+)"/i,
      /"salePrice"\s*:\s*"([^"]+)"/i,
      /"discountedPrice"\s*:\s*"([^"]+)"/i,
      /"sellingPrice"\s*:\s*"([^"]+)"/i,
      /"price"\s*:\s*([0-9]+(?:\.[0-9]+)?)/i,
      /"salePrice"\s*:\s*([0-9]+(?:\.[0-9]+)?)/i,
    ]);
  }

  if (source === "Hepsiburada") {
    return tryMany([
      /"price"\s*:\s*"([^"]+)"/i,
      /"finalPrice"\s*:\s*"([^"]+)"/i,
      /"currentPrice"\s*:\s*"([^"]+)"/i,
      /"price"\s*:\s*([0-9]+(?:\.[0-9]+)?)/i,
      /"finalPrice"\s*:\s*([0-9]+(?:\.[0-9]+)?)/i,
    ]);
  }

  if (source === "Amazon") {
    // Amazon HTML karmaşık; JSON-LD yoksa meta + bazı pattern’ler
    return tryMany([
      /"priceAmount"\s*:\s*"([^"]+)"/i,
      /"price"\s*:\s*"([^"]+)"/i,
      /data-a-color="price"[\s\S]*?([0-9\.\,]+)\s*TL/i,
      /([0-9\.\,]+)\s*TL<\/span>/i,
    ]);
  }

  return null;
}

/** Kargo fallback (şimdilik çok basit) */
function shippingFallback(html: string): number {
  const m = html.match(/kargo[^0-9]{0,20}([0-9\.\,]+)\s*(₺|TL)/i);
  const n = m?.[1] ? parseNumberLike(m[1]) : null;
  if (n && n > 0) return Math.round(n);
  return 0;
}

export async function fetchSource(url: string, source: Source): Promise<{ offers: Offer[] }> {
  if (source === "Other") return { offers: [] };

  const html = await fetchHtml(url, source);

  // 1) JSON-LD
  let price: number | null = null;
  let inStock = true;

  const jsons = extractJsonLdBlocks(html);
  const ld = findFromJsonLd(jsons);
  if (ld?.price) {
    price = ld.price;
    inStock = inStockFromAvailability(ld.availability);
  }

  // 2) Meta price
  if (!price) {
    const c = metaContent(html, [
      /property=["']product:price:amount["'][^>]*content=["']([^"']+)["']/i,
      /property=["']og:price:amount["'][^>]*content=["']([^"']+)["']/i,
      /name=["']twitter:data1["'][^>]*content=["']([^"']+)["']/i,
      /name=["']price["'][^>]*content=["']([^"']+)["']/i,
    ]);
    if (c) price = parseNumberLike(c);
  }

  // 3) Kaynak bazlı fallback
  if (!price) {
    price = priceFallbackBySource(html, source);
  }

  // 4) Hala yoksa boş dön
  if (!price || price <= 0) return { offers: [] };

  // 5) Kargo (MVP: çoğu dinamik; yakalarsak ekle)
  const shipping = shippingFallback(html);

  const offer: Offer = {
    store: source,
    price: Math.round(price),
    shipping,
    inStock,
    url,
    trustLevel: trustFromSource(source),
  };

  return { offers: [offer] };
}
