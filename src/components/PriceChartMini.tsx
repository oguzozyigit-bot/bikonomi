type Props = {
  points: number[]; // fiyat noktaları (örn: 30 gün)
};

export default function PriceChartMini({ points }: Props) {
  const w = 600;
  const h = 180;
  const pad = 14;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = Math.max(1, max - min);

  const xs = points.map((_, i) => pad + (i * (w - pad * 2)) / (points.length - 1));
  const ys = points.map((v) => {
    const t = (v - min) / span; // 0..1
    return h - pad - t * (h - pad * 2);
  });

  const d = xs.map((x, i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${ys[i].toFixed(2)}`).join(" ");

  const lastX = xs[xs.length - 1];
  const lastY = ys[ys.length - 1];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-medium">Fiyat Geçmişi</div>
        <div className="text-xs text-white/50">Son 30 gün</div>
      </div>

      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        {/* grid */}
        {[0, 1, 2, 3].map((i) => {
          const y = pad + (i * (h - pad * 2)) / 3;
          return <line key={i} x1={pad} y1={y} x2={w - pad} y2={y} stroke="rgba(255,255,255,0.06)" />;
        })}

        {/* line */}
        <path d={d} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="3" strokeLinecap="round" />

        {/* last point */}
        <circle cx={lastX} cy={lastY} r="5" fill="rgba(34,197,94,0.95)" />
      </svg>

      <div className="mt-3 flex items-center justify-between text-xs text-white/60">
        <span>Min: {min.toLocaleString("tr-TR")} ₺</span>
        <span>Max: {max.toLocaleString("tr-TR")} ₺</span>
      </div>
    </div>
  );
}
