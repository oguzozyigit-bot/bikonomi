import Link from "next/link";

export default function Header({ q = "" }: { q?: string }) {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        padding: "8px 0 14px",
      }}
    >
      <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              background: "linear-gradient(135deg,#2b59ff,#ff7a00)",
              display: "grid",
              placeItems: "center",
              color: "white",
              fontWeight: 900,
            }}
          >
            b
          </div>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontWeight: 950, letterSpacing: -0.3, fontSize: 18 }}>bikonomi</div>
            <div style={{ opacity: 0.7, fontSize: 12 }}>fiyatı anlamlandırır</div>
          </div>
        </div>
      </Link>

      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {/* Arama her sayfada: action "/" => her yerden aratınca ana sayfada sonuç */}
        <form action="/" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            name="q"
            defaultValue={q}
            placeholder="Ürün ara (örn: iPhone)"
            style={{
              width: 280,
              maxWidth: "60vw",
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid #ddd",
              background: "rgba(255,255,255,.95)",
              fontSize: 13,
            }}
          />
          <button
            type="submit"
            style={{
              padding: "10px 12px",
              borderRadius: 14,
              border: "1px solid #ddd",
              background: "#111",
              color: "#fff",
              fontWeight: 900,
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            Ara
          </button>
        </form>

        <nav style={{ display: "flex", gap: 12, fontSize: 13, opacity: 0.9 }}>
          <Link href="/how-it-works" style={{ textDecoration: "none" }}>Nasıl Çalışır?</Link>
          <Link href="/about" style={{ textDecoration: "none" }}>Hakkımızda</Link>
        </nav>
      </div>
    </header>
  );
}
