import Link from "next/link";
import { prisma } from "@/lib/db";
import Header from "@/components/site/Header";
import Sparkline from "@/components/site/Sparkline";
import TrendIcon from "@/components/site/TrendIcon";
import MarketplaceBadge from "@/components/site/MarketplaceBadge";
import { calculateBikonomiScore } from "@/lib/bikonomiScore";

function fmtTRY(kurus: number) {
  return (kurus / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺";
}
function pct(v: number) {
  return Math.abs(v).toFixed(1) + "%";
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { q?: string };
}) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      offers: { include: { snapshots: { orderBy: { capturedAt: "desc" }, take: 7 } } },
    },
  });

  if (!product) return <div style={{ padding: 20 }}>Ürün bulunamadı.</div>;

  await prisma.product.update({
    where: { id: product.id },
    data: { views: { increment: 1 } },
  });

  const offersSorted = product.offers.slice().sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  const bestOffer = offersSorted[0];
  const snaps = bestOffer?.snapshots ?? [];

  const today = snaps[0]?.price ?? bestOffer?.price ?? 0;
  const yesterday = snaps[1]?.price ?? today;
  const deltaPct = yesterday === 0 ? 0 : ((today - yesterday) / yesterday) * 100;

  const bikonomiScore = calculateBikonomiScore({
    deltaPct,
    historyCount: snaps.length,
    offerCount: product.offers.length,
  });

  const badge =
    bikonomiScore >= 80
      ? { text: "ALINABİLİR", bg: "rgba(22,163,74,0.12)", color: "#166534" }
      : bikonomiScore >= 55
      ? { text: "TAKİP ET", bg: "rgba(234,179,8,0.14)", color: "#854d0e" }
      : { text: "BEKLE", bg: "rgba(220,38,38,0.12)", color: "#991b1b" };

  const spark = snaps.map((s) => s.price).reverse();

  return (
    <main className="container">
      <Header q={searchParams?.q} />

      <section
        className="heroGrid"
        style={{
          position: "relative",
          overflow: "hidden",
          border: "1px solid #eee",
          borderRadius: 28,
          padding: 16,
          marginTop: 6,
          backgroundImage: "url(/hero.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg, rgba(255,255,255,.94) 0%, rgba(255,255,255,.72) 55%, rgba(255,255,255,.22) 100%)",
          }}
        />

        <div style={{ position: "relative", zIndex: 1 }}>
          <Link href="/" style={{ opacity: 0.85, textDecoration: "none" }}>
            ← Ana sayfa
          </Link>

          <h1 style={{ fontSize: 28, fontWeight: 950, margin: "10px 0 0" }}>{product.title}</h1>
{(() => {
  const score = bikonomiScore;
  const badge =
    score >= 80
      ? { text: "ALINABİLİR", bg: "rgba(22,163,74,0.12)", color: "#166534" }
      : score >= 55
      ? { text: "TAKİP ET", bg: "rgba(234,179,8,0.14)", color: "#854d0e" }
      : { text: "BEKLE", bg: "rgba(220,38,38,0.12)", color: "#991b1b" };

  return (
    <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
      <div
        style={{
          padding: "8px 12px",
          borderRadius: 999,
          border: "1px solid #eee",
          background: badge.bg,
          color: badge.color,
          fontWeight: 950,
          fontSize: 13,
        }}
      >
        {badge.text}
      </div>

      <div
        style={{
          padding: "8px 12px",
          borderRadius: 12,
          border: "1px solid #eee",
          background: "#fff",
          fontWeight: 950,
          fontSize: 13,
        }}
      >
        Bikonomi Skoru: {score}/100
      </div>

      <div style={{ fontSize: 12, opacity: 0.75 }}>(trend • geçmiş • satıcı)</div>
    </div>
  );
})()}

          {/* TEST: Bu yazı görünmüyorsa deploy gelmiyordur */}
          <div style={{ marginTop: 8, fontWeight: 900, color: "red" }}>TEST: SCORE BLOCK</div>

          {/* Skor rozetleri */}
          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                border: "1px solid #eee",
                background: badge.bg,
                color: badge.color,
                fontWeight: 950,
                fontSize: 13,
              }}
            >
              {badge.text}
            </div>

            <div
              style={{
                padding: "8px 12px",
                borderRadius: 12,
                border: "1px solid #eee",
                background: "#fff",
                fontWeight: 950,
                fontSize: 13,
              }}
            >
              Bikonomi Skoru: {bikonomiScore}/100
            </div>

            <div style={{ fontSize: 12, opacity: 0.75 }}>(trend • geçmiş • satıcı)</div>
          </div>

          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, opacity: 0.8 }}>Son hareket:</span>
            <span style={{ fontWeight: 900, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <TrendIcon deltaPct={deltaPct} /> {pct(deltaPct)}
            </span>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 1, display: "grid", justifyItems: "end", alignContent: "center" }}>
          <div style={{ border: "1px solid #eee", background: "rgba(255,255,255,.85)", borderRadius: 18, padding: 10 }}>
            <div style={{ fontWeight: 900, fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Son 7 kayıt</div>
            <Sparkline values={spark.length ? spark : [today]} />
          </div>
        </div>
      </section>

      <section style={{ marginTop: 14, border: "1px solid #eee", borderRadius: 16, padding: 14, background: "#fff" }}>
        <div style={{ fontWeight: 950 }}>🛒 Pazaryerleri</div>

        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
          {offersSorted.map((o) => (
            <div
              key={o.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 14,
                padding: 12,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 10,
                background: "#fff",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <MarketplaceBadge source={o.source} />
                <div style={{ fontWeight: 950 }}>{fmtTRY(o.price)}</div>
                <div style={{ opacity: 0.75, fontSize: 12 }}>{o.sellerName || ""}</div>
              </div>

              <a
                href={o.url || "#"}
                target="_blank"
                rel="nofollow sponsored noopener"
                style={{
                  textDecoration: "none",
                  fontWeight: 950,
                  border: "1px solid #eee",
                  padding: "10px 12px",
                  borderRadius: 999,
                  background: "#fff",
                  whiteSpace: "nowrap",
                }}
              >
                Mağazaya git →
              </a>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ opacity: 0.6, fontSize: 12, marginTop: 18 }}>
        © {new Date().getFullYear()} bikonomi • demo
      </footer>
    </main>
  );
}
