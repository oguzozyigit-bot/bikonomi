// lib/sourceRouter.ts
import type { NormalizedProduct } from "./normalize";
import { normalizeTrendyol } from "./sources/trendyol";

// İstersen sonra ekleriz:
// import { normalizeHepsiburada } from "./sources/hepsiburada";
// import { normalizeN11 } from "./sources/n11";
// import { normalizeAmazonTr } from "./sources/amazonTr";

export async function normalizeFromUrl(url: string): Promise<NormalizedProduct> {
  const u = url.toLowerCase();

  if (u.includes("trendyol.com")) return normalizeTrendyol(url);

  // MVP: şimdilik sadece Trendyol
  throw new Error("Bu kaynak henüz desteklenmiyor (MVP: Trendyol).");
}
