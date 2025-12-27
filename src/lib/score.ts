// src/lib/score.ts

export type Offer = {
  store: "Trendyol" | "Hepsiburada" | "Amazon" | string;
  price: number;     // ürün fiyatı
  shipping: number;  // kargo ücreti (yoksa 0)
  inStock: boolean;
  url: string;
};

export type HistoryPoint = {
  date: string; // ISO
  price: number;
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function median(nums: number[]) {
  const s = [...nums].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 === 0 ? (s[m - 1] + s[m]) / 2 : s[m];
}

export function computeBikonomiScore(opts: {
  offers: Offer[];
  history?: HistoryPoint[];
}) {
  const inStockOffers = opts.offers.filter((o) => o.inStock);
  if (inStockOffers.length === 0) {
    return {
      score: 0,
      cheapestTotal: 0,
      medianTotal: 0,
      trend30dPct: 0,
      chosenOffer: null,
      breakdown: {
        priceScore: 0,
        marketScore: 0,
        trendScore: 0,
        trustScore: 0,
        availabilityScore: 0,
      },
    };
  }

  const totals = inStockOffers.map((o) => o.price + (o.shipping || 0));
  const cheapestTotal = Math.min(...totals);
  const medianTotal = median(totals);

  // MVP: En iyi teklif = en ucuz stokta olan
  const chosenIdx = totals.indexOf(cheapestTotal);
  const chosenOffer = inStockOffers[chosenIdx];
  const chosenTotal = cheapestTotal;

  // --- PriceScore (0–45): en ucuz yakındaysan yüksek ---
  // En ucuzu seçtiğimiz için ratio=1 ama ileride "seçili teklif" farklı olabilir.
  const ratio = cheapestTotal / chosenTotal; // 0..1
  const priceScore = clamp(Math.pow(ratio, 0.6) * 45, 0, 45);

  // --- MarketScore (0–20): median’dan sapma ---
  const delta = Math.abs(chosenTotal - medianTotal) / (medianTotal || 1);
  const marketScore = clamp(20 * (1 - Math.min(delta, 0.4) / 0.4), 0, 20);

  // --- TrendScore (0–15): son 30 günde artış -> ceza ---
  let trendScore = 10; // history yoksa nötr
  let trend30dPct = 0;

  if (opts.history && opts.history.length >= 2) {
    const h = [...opts.history].sort(
      (a, b) => +new Date(a.date) - +new Date(b.date)
    );
    const latest = h[h.length - 1];
    const latestT = +new Date(latest.date);

    // en az 30 gün öncesine yakın bir noktayı bul
    const past = [...h]
      .reverse()
      .find((p) => latestT - +new Date(p.date) >= 1000 * 60 * 60 * 24 * 30);

    if (past && past.price > 0) {
      trend30dPct = (latest.price - past.price) / past.price;
      const penalty = clamp(trend30dPct / 0.3, 0, 1); // %30 artış = max ceza
      trendScore = 15 * (1 - penalty);
    }
  }

  // --- TrustScore (0–10): kaynak + veri kalitesi ---
  // Şimdilik: Trendyol canlı = 8, history varsa +1, url varsa +1
  let trustScore = 8;
  if (opts.history && opts.history.length > 0) trustScore += 1;
  if (chosenOffer.url) trustScore += 1;
  trustScore = clamp(trustScore, 0, 10);

  // --- AvailabilityScore (0–10) ---
  const availabilityScore = chosenOffer.inStock ? 10 : 0;

  const score = clamp(
    priceScore + marketScore + trendScore + trustScore + availabilityScore,
    0,
    100
  );

  return {
    score: Math.round(score),
    cheapestTotal,
    medianTotal,
    trend30dPct,
    chosenOffer: {
      ...chosenOffer,
      total: chosenTotal,
    },
    breakdown: {
      priceScore: Math.round(priceScore),
      marketScore: Math.round(marketScore),
      trendScore: Math.round(trendScore),
      trustScore: Math.round(trustScore),
      availabilityScore: Math.round(availabilityScore),
    },
  };
}
