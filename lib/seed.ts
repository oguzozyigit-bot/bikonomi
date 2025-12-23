export type Product = {
  id: string;
  title: string;
  category: string;
  score: number;
  cheapestPrice: number;
  currency: "TRY";
  cheapestStore: string;
  marketDeltaPct: number;
  history: number[];
  breakdown: { price: number; quality: number; trust: number };
  offers: { store: string; price: number }[];
};

export const seedProducts: Product[] = [
  {
    id: "p1",
    title: "Apple AirPods Pro 2 (USB-C)",
    category: "Elektronik",
    score: 86,
    cheapestPrice: 6999,
    currency: "TRY",
    cheapestStore: "Trendyol",
    marketDeltaPct: 8,
    history: [7600, 7550, 7480, 7400, 7350, 7300, 7250, 7190, 7090, 6999],
    breakdown: { price: 30, quality: 28, trust: 28 },
    offers: [
      { store: "Trendyol", price: 6999 },
      { store: "Hepsiburada", price: 7199 },
      { store: "Amazon", price: 7349 },
    ],
  },
  {
    id: "p2",
    title: "LED Masa Lambası (Dokunmatik)",
    category: "Ev",
    score: 73,
    cheapestPrice: 349,
    currency: "TRY",
    cheapestStore: "Hepsiburada",
    marketDeltaPct: 13,
    history: [399, 389, 379, 369, 365, 359, 349, 349, 349, 349],
    breakdown: { price: 26, quality: 24, trust: 23 },
    offers: [
      { store: "Hepsiburada", price: 349 },
      { store: "Trendyol", price: 369 },
      { store: "Amazon", price: 389 },
    ],
  },
  // ... diğerleri (p3-p10) aynı mantık
];

export function getSeedProduct(id: string) {
  return seedProducts.find((p) => p.id === id) || null;
}
