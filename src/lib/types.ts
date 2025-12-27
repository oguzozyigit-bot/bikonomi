export type Source = "Trendyol" | "Hepsiburada" | "Amazon" | "Other";

export type Verdict = "Alınır" | "Düşünülebilir" | "Uzak Dur";
export type OfferVerdict = "Mantıklı" | "Olur" | "Mantıksız";

export type Offer = {
  store: string;
  price: number;     // ürün fiyatı
  shipping: number;  // kargo
  inStock: boolean;
  url: string;
  trustLevel: 0 | 1 | 2;
  total?: number;
  verdict?: OfferVerdict;
};

export type MarketInfo = {
  avgPrice: number | null;
  confidence: number; // 0..1
  sampleCount: number;
};

export type Score = {
  final: number;
  verdict: Verdict;
  summary: string;
  breakdown: {
    price: number;
    shipping: number;
    trust: number;
    market: number;
  };
};

export type AnalyzeResponse = {
  ok: boolean;
  mode: "auto" | "partial" | "manual_required";
  product: {
    productKey: string;
    source: Source;
    title: string;
    image: string;
  };
  market: MarketInfo;
  score: Score;
  offers: Offer[];
  actions: {
    allowManual: boolean;
    searchLinks: Array<{ store: string; url: string }>;
  };
  message?: string;
};
