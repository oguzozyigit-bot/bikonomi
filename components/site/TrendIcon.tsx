export default function TrendIcon({ deltaPct }: { deltaPct: number }) {
  const up = deltaPct > 0.5;
  const down = deltaPct < -0.5;

  if (up) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: "#16a34a", fontWeight: 900 }}>▲</span>
      </span>
    );
  }

  if (down) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span style={{ color: "#dc2626", fontWeight: 900 }}>▼</span>
      </span>
    );
  }

  // stabil: tri-line
  return (
    <span style={{ display: "inline-flex", alignItems: "center" }} title="Stabil">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 8h14" stroke="#64748b" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M7 12h10" stroke="#94a3b8" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M9 16h6" stroke="#cbd5e1" strokeWidth="2.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}
