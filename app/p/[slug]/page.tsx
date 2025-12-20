import { calculateBikonomiScore } from "@/lib/bikonomiScore";
import Link from "next/link";
import { prisma } from "@/lib/db";
import Header from "@/components/site/Header";
import Sparkline from "@/components/site/Sparkline";
import TrendIcon from "@/components/site/TrendIcon";
import MarketplaceBadge from "@/components/site/MarketplaceBadge";

/* helpers */
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
      offers: {
        include: {
          snapshots: { orderBy: { capturedAt: "desc" }, take: 7 },
        },
      },
    },
  });

  if (!product) {
    return <div style={{ padding: 20 }}>Ürün bulunamadı.</div>;
  }

  await prisma.product.update({
    where: { id: product.id },
    data: { views: { increment: 1 } },
  });

  const bestOffer = product.offers
    .slice()
    .sort((a, b) => (a.price ?? 0) - (b.price ?? 0))[0];

  const snaps = bestOffer?.snapshots ?? [];
  const spark = snaps.map(s => s.price).reverse();

  const today = snaps[0]?.price ?? bestOffer?.price ?? 0;
  const yesterday = snaps[1]?.price ?? today;
  const deltaPct = yesterday === 0 ? 0 : ((today - yesterday) / yesterday) * 100;
// Bikonomi Skoru
const bikonomiScore = calculateBikonomiScore({
  deltaPct,
  historyCount: snapsRaw.length,
  offerCount: product.offers.length,
});

  return (
    <main className="container">
      <Header q={searchParams?.q} />

      <section
        style={{
          border: "1px solid #eee",
          borderRadius: 20,
          padding: 16,
          backgroundImage: "url(/hero.png)",
          backgroundSize: "cover",
        }}
      >
        <Link href="/">← Ana sayfa</Link>

        <h1 style={{ fontSize: 28, fontWeight: 900 }}>{product.title}</h1>
{(() => {
  const score = bikonomiScore;
  const badge =
    score >= 80 ? { text: "ALINABİLİR", bg: "rgba(22,163,74,0.12)", color: "#166534" } :
    score >= 55 ? { text: "TAKİP ET",   bg: "rgba(234,179,8,0.14)", color: "#854d0e" } :
                  { text: "BEKLE",      bg: "rgba(220,38,38,0.12)", color: "#991b1b" };

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

      <div style={{ fontSize: 12, opacity: 0.75 }}>
        (7g trend • geçmiş • satıcı sayısı)
      </div>
    </div>
  );
})()}

        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <TrendIcon deltaPct={deltaPct} />
          <b>{pct(deltaPct)}</b>
        </div>

        <div style={{ marginTop: 10 }}>
          <Sparkline values={spark.length ? spark : [today]} />
        </div>
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>🛒 Pazaryerleri</h3>

        {product.offers.map(o => (
          <div
            key={o.id}
            style={{
              border: "1px solid #eee",
              borderRadius: 12,
              padding: 12,
              marginTop: 8,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div>
              <MarketplaceBadge source={o.source} />
              <div style={{ fontWeight: 900 }}>{fmtTRY(o.price)}</div>
            </div>

            <a
              href={o.url || "#"}
              target="_blank"
              rel="nofollow sponsored noopener"
            >
              Mağazaya git →
            </a>
          </div>
        ))}
      </section>

      <footer style={{ marginTop: 30, opacity: 0.6 }}>
        © {new Date().getFullYear()} bikonomi
      </footer>
    </main>
  );
}