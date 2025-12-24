export type FetchedProduct = {
  source: "trendyol" | "hepsiburada" | "amazon" | "unknown";
  url: string;
  title: string;
  price: number | null;
  currency: "TRY" | "USD" | "EUR" | string;
  rating: number | null;
  ratingCount: number | null;
};
