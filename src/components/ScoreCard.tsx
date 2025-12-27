// örn: components/ScoreCard.tsx

export function ScoreCard({ score, breakdown }: any) {
  return (
    <div className="rounded-xl border p-4 bg-white shadow">
      <div className="text-4xl font-bold">{score}</div>
      <div className="text-sm text-gray-500">Bikonomi Skoru</div>

      <div className="mt-4 space-y-2 text-sm">
        <div>💸 Fiyat: {breakdown.priceScore}/45</div>
        <div>📊 Piyasa: {breakdown.marketScore}/20</div>
        <div>📈 Trend: {breakdown.trendScore}/15</div>
        <div>🛡 Güven: {breakdown.trustScore}/10</div>
        <div>📦 Stok: {breakdown.availabilityScore}/10</div>
      </div>
    </div>
  );
}
