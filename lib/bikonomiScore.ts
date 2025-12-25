type OfferLite = {
  price: number;
  shippingPrice?: number | null;
  inStock: boolean;
  rating?: number | null;
  reviewCount?: number | null;
};

type ScoreInput = {
  deltaPct: number;      // fiyat değişimi %
  historyCount: number;  // fiyat geçmişi sayısı
  offerCount: number;    // satıcı sayısı
};

// Eski fonksiyonun kalsın (istersek sonra kullanırız)
export function calculateBikonomiScore({ deltaPct, historyCount, offerCount }: ScoreInput) {
  let score = 50;

  if (Math.abs(deltaPct) < 3) score += 15;
  else if (Math.abs(deltaPct) < 10) score += 5;
  else score -= 10;

  score += Math.min(historyCount, 20);
  score += Math.min(offerCount * 5, 15);

  if (score < 0) score = 0;
  if (score > 100) score = 100;

  return Math.round(score);
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

function totalPrice(o: OfferLite) {
  return o.price + (o.shippingPrice ?? 0);
}

function median(nums: number[]) {
  if (nums.length === 0) return null;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * ✅ API'nin beklediği fonksiyon:
 * Offer’lardan (stokta olanlar) en ucuzu + piyasa medyanı + rating’e göre 0-100 skor üretir.
 */
export function computeBikonomiScoreFromOffers(offers: OfferLite[]) {
  const available = offers.filter(o => o.inStock);

  if (available.length === 0) {
    return { total: null as number | null, breakdown: { reason: "no_stock" } };
  }

  // En ucuz offer (kargo dahil)
  const cheapest = [...available].sort((a, b) => totalPrice(a) - totalPrice(b))[0];
  const cheapestTotal = totalPrice(cheapest);

  // Medyan (piyasa benchmark)
  const med = median(available.map(totalPrice));

  // 1) Fiyat skoru (0..60)
  let priceScore = 30;
  if (med && med > 0) {
    const diff = (med - cheapestTotal) / med; // + ucuz
    priceScore = clamp(30 + diff * 150, 0, 60);
  }

  // 2) Kalite skoru (0..25)
  let qualityScore = 10;
  if (typeof cheapest.rating === "number") {
    qualityScore = clamp((cheapest.rating / 5) * 25, 0, 25);
    if ((cheapest.reviewCount ?? 0) < 10) qualityScore *= 0.85;
  }

  // 3) Güven skoru (0..15)
  let trustScore = 8;
  if (available.length >= 3) trustScore += 3;
  if (available.length >= 5) trustScore += 4;
  trustScore = clamp(trustScore, 0, 15);

  const total = Math.round(clamp(priceScore + qualityScore + trustScore, 0, 100));

  return {
    total,
    breakdown: {
      cheapestTotal,
      medianTotal: med,
      offersInStock: available.length,
      priceScore: Math.round(priceScore),
      qualityScore: Math.round(qualityScore),
      trustScore: Math.round(trustScore),
      usedRating: cheapest.rating ?? null,
      usedReviewCount: cheapest.reviewCount ?? null,
    },
  };
}


