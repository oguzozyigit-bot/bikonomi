import React from "react";

export type ScoreBreakdown = {
  priceScore: number;
  trustScore: number;
  qualityScore: number;
  cheapestTotal?: number;
  medianTotal?: number;
  offersInStock?: number;
};

function Card({ title, value, hint }: { title: string; value: number; hint: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-sm font-medium text-gray-600">{title}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-gray-500">{hint}</div>
    </div>
  );
}

export function ScoreBreakdownCards({ b }: { b: ScoreBreakdown }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <Card title="Fiyat" value={b.priceScore} hint="Piyasa dengesine göre" />
      <Card title="Güven" value={b.trustScore} hint="Satıcı & stok sinyalleri" />
      <Card title="Kalite" value={b.qualityScore} hint="Yorum ve ürün sinyalleri" />
    </div>
  );
}
