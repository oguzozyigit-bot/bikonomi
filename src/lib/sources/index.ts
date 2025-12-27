// src/lib/sources/index.ts
import { fetchTrendyolProduct } from "./trendyol";
import { fetchHepsiburada } from "./hepsiburada";

export type FetchResult = {
  source: "trendyol" | "hepsiburada" | "unknown";
  product: {
    title: string;
    price: number | null;
    currency: "TRY" | "USD" | "EUR";
    url: string;
    image: string | null;
    shipping?: number | null;
    inStock?: boolean | null;
    rating?: number | null;
    ratingCount?: number | null;
  };
  debug?: Record<string, any>;
};

function pickCurrency(x: any): "TRY" | "USD" | "EUR" {
  const c = String(x ?? "").toUpperCase();
  if (c === "USD") return "USD";
  if (c === "EUR") return "EUR";
  return "TRY";
}

export async function fetchBySource(
  source: "trendyol" | "hepsiburada" | "unknown",
  u: string
): Promise<FetchResult> {
  if (source === "trendyol") {
    const p: any = await fetchTrendyolProduct(u);

    return {
      source,
      product: {
        title: String(p?.title ?? ""),
        price: typeof p?.price === "number" ? p.price : (p?.price ?? null),
        currency: pickCurrency((p as any)?.currency ?? "TRY"), // ✅ FIX: currency yoksa TRY
        url: u,
        image: p?.image ?? null,
        shipping: typeof (p as any)?.shipping === "number" ? (p as any).shipping : ((p as any)?.shipping ?? null),
        inStock: typeof (p as any)?.inStock === "boolean" ? (p as any).inStock : ((p as any)?.inStock ?? null),
        rating: typeof (p as any)?.rating === "number" ? (p as any).rating : ((p as any)?.rating ?? null),
        ratingCount:
          typeof (p as any)?.ratingCount === "number" ? (p as any).ratingCount : ((p as any)?.ratingCount ?? null),
      },
      debug: {
        via: "fetchTrendyolProduct",
        keys: p ? Object.keys(p) : [],
      },
    };
  }

  if (source === "hepsiburada") {
    const r: any = await fetchHepsiburada(u);

    // Eğer zaten FetchResult gibi dönüyorsa
    if (r?.product) {
      return {
        source: "hepsiburada",
        product: {
          title: String(r.product.title ?? ""),
          price: r.product.price ?? null,
          currency: pickCurrency(r.product.currency ?? "TRY"),
          url: r.product.url ?? u,
          image: r.product.image ?? null,
        },
        debug: r.debug,
      };
    }

    // Değilse minimum normalize
    return {
      source: "hepsiburada",
      product: {
        title: String(r?.title ?? ""),
        price: r?.price ?? null,
        currency: pickCurrency(r?.currency ?? "TRY"),
        url: u,
        image: r?.image ?? null,
      },
      debug: { via: "fetchHepsiburada-min" },
    };
  }

  return {
    source: "unknown",
    product: {
      title: "",
      price: null,
      currency: "TRY",
      url: u,
      image: null,
    },
    debug: { note: "unknown source" },
  };
}
