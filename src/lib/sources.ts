import { MarketInfo, Offer, OfferVerdict, Score, Verdict } from "@/lib/types";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function bestTotal(offers: Offer[]) {
  const totals = offers.map((o) => (o.price || 0) + (o.shipping || 0)).filter((t) => t > 0);
  if (!totals.length) return null;
  return Math.min(...totals);
}

function verdictFromScore(s: number): Verdict {
  if (s >= 80) return "Alınır";
  if (s >= 60) return "Düşünülebilir";
  return "Uzak Dur";
}

function summaryFromVerdict(v: Verdict) {
  if (v === "Alınır") return "Bu fiyat, piyasa ortalamasına göre mantıklı.";
  if (v === "Düşünülebilir") return "Fiyat makul, alternatifler kontrol edilebilir.";
  return "Bu fiyat, piyasaya göre mantıklı görünmüyor.";
}

export function computeOfferVerdict(params: {
  offer: Offer;
  marketAvg: number | null;
  bestTotal: number | null;
}): OfferVerdict {
  const { offer, marketAvg, bestTotal } = params;

  const price = offer.price || 0;
  const shipping = offer.shipping || 0;
  const total = price + shipping;

  if (!offer.inStock) return "Mantıksız";
  if (total <= 0) return "Mantıksız";

  let v: OfferVerdict = "Olur";

  if (marketAvg && marketAvg > 0) {
    const diffPct = (total - marketAvg) / marketAvg;
    if (diffPct <= -0.10) v = "Mantıklı";
    else if (diffPct <= 0.08) v = "Olur";
    else v = "Mantıksız";
  } else if (bestTotal && bestTotal > 0) {
    const gapPct = (total - bestTotal) / bestTotal;
    if (gapPct <= 0.03) v = "Mantıklı";
    else if (gapPct <= 0.10) v = "Olur";
    else v = "Mantıksız";
  }

  // Kargo overrule
  const shipPct = price > 0 ? shipping / price : 1;
  if (shipPct > 0.15) return "Mantıksız";
  if (shipPct > 0.08) {
    if (v === "Mantıklı") v = "Olur";
    else if (v === "Olur") v = "Mantıksız";
  }

  // Güven overrule
  if (offer.trustLevel === 0) {
    if (v === "Mantıklı") v = "Olur";
    else if (v === "Olur") v = "Mantıksız";
  }

  return v;
}

export function computeScore(input: { offers: Offer[]; market: MarketInfo }): Score {
  const offers = input.offers || [];
  const marketAvg = input.market?.avgPrice ?? null;

  const bTotal = bestTotal(offers);

  // En iyi teklif (skor hesapları bununla)
  const bestOffer =
    offers
      .map((o) => ({ o, total: (o.price || 0) + (o.shipping || 0) }))
      .filter((x) => x.total > 0)
      .sort((a, b) => a.total - b.total)[0]?.o ?? null;

  // veri yoksa fail-soft orta skor
  if (!bestOffer || !bTotal) {
    const final = 60;
    const verdict = verdictFromScore(final);
    return {
      final,
      verdict,
      summary: summaryFromVerdict(verdict),
      breakdown: { price: 20, shipping: 14, trust: 16, market: 10 },
    };
  }

  const bestShipping = bestOffer.shipping || 0;
  const bestPrice = bestOffer.price || 0;
  const bestInStock = bestOffer.inStock;
  const trustLevel = bestOffer.trustLevel;

  // 1) priceScore 0-40
  let priceScore = 20;
  if (marketAvg && marketAvg > 0) {
    const deltaPct = (marketAvg - bTotal) / marketAvg;
    if (deltaPct >= 0.2) priceScore = 40;
    else if (deltaPct >= 0.1) priceScore = 32;
    else if (deltaPct >= 0.0) priceScore = 24;
    else if (deltaPct >= -0.1) priceScore = 16;
    else priceScore = 8;
  }

  // 2) shippingScore 0-20
  let shippingScore = 8;
  if (bestShipping === 0) shippingScore = 20;
  else if (bestPrice > 0 && bestShipping <= bestPrice * 0.03) shippingScore = 14;
  else if (bestPrice > 0 && bestShipping <= bestPrice * 0.07) shippingScore = 8;
  else shippingScore = 2;

  // 3) trustScore 0-20
  let trustScore = 6;
  if (!bestInStock) trustScore = 0;
  else if (trustLevel === 2) trustScore = 20;
  else if (trustLevel === 1) trustScore = 12;
  else trustScore = 6;

  // 4) marketScore 0-20
  let marketScore = 10;
  if (marketAvg && marketAvg > 0) {
    const diff = (bTotal - marketAvg) / marketAvg;
    if (diff <= -0.15) marketScore = 20;
    else if (diff <= -0.05) marketScore = 16;
    else if (diff <= 0.05) marketScore = 12;
    else if (diff <= 0.15) marketScore = 6;
    else marketScore = 2;
  }

  const final = clamp(priceScore + shippingScore + trustScore + marketScore, 0, 100);
  const verdict = verdictFromScore(final);

  return {
    final,
    verdict,
    summary: summaryFromVerdict(verdict),
    breakdown: { price: priceScore, shipping: shippingScore, trust: trustScore, market: marketScore },
  };
}

