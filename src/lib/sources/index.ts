import { fetchTrendyol } from "./trendyol";
import { fetchHepsiburada } from "./hepsiburada";

export type FetchResult = {
  source: string;
  product: {
    title: string;
    price: number | null;
    currency: string;
    url: string;
    image: string | null;
  };
  debug?: Record<string, any>;
};

export async function fetchBySource(
  source: "trendyol" | "hepsiburada",
  u: string
): Promise<FetchResult> {
  if (source === "trendyol") return fetchTrendyol(u);
  if (source === "hepsiburada") return fetchHepsiburada(u);

  // fallback (teorik olarak hiç düşmez)
  return {
    source,
    product: {
      title: "",
      price: null,
      currency: "TRY",
      url: u,
      image: null,
    },
  };
}
