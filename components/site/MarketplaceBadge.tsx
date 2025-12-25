type Src = "trendyol" | "hepsiburada" | "amazon" | string;

export default function MarketplaceBadge({ source }: { source: Src }) {
  const s = (source || "manual").toLowerCase();

  const conf =
    s === "trendyol"
      ? { bg: "#ff7a00", text: "Trendyol" }
      : s === "hepsiburada"
      ? { bg: "#ff6000", text: "Hepsiburada" }
      : s === "amazon"
      ? { bg: "#111827", text: "Amazon" }
      : { bg: "#334155", text: s.toUpperCase() };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 10px",
        borderRadius: 999,
        border: "1px solid #e5e7eb",
        background: "#fff",
        fontSize: 12,
        fontWeight: 900,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 10, height: 10, borderRadius: 999, background: conf.bg }} />
      {conf.text}
    </span>
  );
}
