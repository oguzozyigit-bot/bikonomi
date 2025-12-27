// src/lib/market.ts
import type { MarketInfo } from "@/lib/types";
import { getRecentPoints } from "@/lib/historyStore";

function median(nums: number[]) {
  if (!nums.length) return null;
  const a = [...nums].sort((x, y) => x - y);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export async function computeMarket(productKey: string): Promise<MarketInfo> {
  const points = await getRecentPoints(productKey, 14);

  const totals = points
    .map((p) => p.total)
    .filter((n) => Number.isFinite(n) && n > 0);

  const m1 = median(totals);
  if (!m1 || totals.length < 4) {
    return { avgPrice: null, confidence: 0, sampleCount: totals.length };
  }

  // ±%35 aykırı filtre
  const filtered = totals.filter((t) => Math.abs(t - m1) / m1 <= 0.35);
  const m2 = median(filtered);

  const count = filtered.length;
  let confidence = 0;
  if (count >= 4 && count <= 7) confidence = 0.4;
  else if (count >= 8 && count <= 14) confidence = 0.7;
  else if (count >= 15) confidence = 0.9;

  return {
    avgPrice: m2 ? Math.round(m2) : null,
    confidence: clamp(confidence, 0, 1),
    sampleCount: count,
  };
}
