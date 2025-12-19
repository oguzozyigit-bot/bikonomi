import Link from "next/link";
import { prisma } from "@/lib/db";
import Header from "@/components/site/Header";
import Sparkline from "@/components/site/Sparkline";
import TrendIcon from "@/components/site/TrendIcon";
import MarketplaceBadge from "@/components/site/MarketplaceBadge";

function fmtTRY(kurus: number) {
  return (kurus / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " ₺";
}
function pct(v: number) {
  return Math.abs(v).toFixed(1) + "%";
}
function bikonomiYorumu(deltaPct: number) {
  if (deltaPct >= 10) return "🧠 Sert artış: kampanya bitişi / stok etkisi olabilir.";
  if (deltaPct >= 3) return "🧠 Kademeli artış trendi var.";
  if (deltaPct <= -10) return "🧠 Sert düşüş: kısa süreli kampanya ihtimali yüksek.";
  if (deltaPct <= -3) return "🧠 Kademeli düşüş var. Fiyat avantajı oluşmuş olabilir.";
  return "🧠 Stabil: belirgin bir hareket yok.";
}

type RangeKey = "day" | "week" | "month";
function rangeLabel(r: RangeKey) {
  if (r === "day") return "Günlük";
  if (r === "week") return "Haftalık";
  return "Aylık";
}

function labelForTarget(range: RangeKey, targetDays: number) {
  if (targetDays === 0) return "Bugün";
  if (range === "day") {
    if (targetDays === 1) return "Dün";
    return `${targetDays} gün önce`;
  }
  if (range === "week") {
    const w = Math.round(targetDays / 7);
    return `${w}. hafta önce`;
  }
  const m = Math.round(targetDays / 30);
  return `${m}. ay önce`;
}

function dateTR(d: Date) {
  return d.toLocaleDateString("tr-TR", { year: "numeric", month: "short", day: "2-digit" });
}

const TAKE = 500;

function allowedDays(range: RangeKey) {
  if (range === "day") return [0, 1, 2, 3, 4, 5, 6]; // son 7 gün
  if (range === "week") return [0, 7, 14, 21, 28]; // son 4 hafta
  return [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330, 360]; // son 12 ay
}

function pickSnapshotsByRange(snaps: { price: number; capturedAt: Date }[], range: RangeKey) {
  if (!snaps.length) return [];
  const allowed = allowedDays(range);
  const picked: { target: number; snap: { price: number; capturedAt: Date } }[] = [];

  for (const target of allowed) {
    const targetDate = new Date(Date.now() - target * 24 * 60 * 60 * 1000);

    let best = snaps[0];
    let bestDiff = Math.abs(new Date(snaps[0].capturedAt).getTime() - targetDate.getTime());

    for (const s of snaps) {
      const diff = Math.abs(new Date(s.capturedAt).getTime() - targetDate.getTime());
      if (diff < bestDiff) {
        best = s;
        bestDiff = diff;
      }
    }
    picked.push({ target, snap: best });
  }

  picked.sort((a, b) => a.target - b.target);
  return picked.reverse();
}

export default async function ProductPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { range?: string; q?: string };
}) {
  const range = (searchParams?.range === "week" || searchParams?.range === "month"
    ? searchParams.range
    : "day") as RangeKey;

  const q = (searchParams?.q || "").trim();

  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      offers: {
        include: {
          snapshots: { orderBy: { capturedAt: "desc" }, take: TAKE },
        },
      },
    },
  });

  if (!product) return <div style={{ padding: 16 }}>Ürün bulunamadı.</div>;

  await prisma.product.update({
    where: { id: product.id },
    data: { views: { increment: 1 } },
  });

  const bestOffer = product.offers.slice().sort((a, b) => (a.price ?? 0) - (b.price ?? 0))[0];

  const snapsRaw = (bestOffer?.snapshots ?? []).map((s) => ({
    price: s.price,
    capturedAt: new Date(s.capturedAt),
  }));

  const picked = snapsRaw.length ? pickSnapshotsByRange(snapsRaw, range) : [];
  const listCount = range === "day" ? 7 : range === "week" ? 4 : 12;

  const today = picked[0]?.snap.price ?? bestOffer?.price ?? 0;
  const ref = picked[1]?.snap.price ?? today;
  const deltaPct = ref === 0 ? 0 : ((today - ref) / ref) * 100;

  // sparkline için son 7 snapshot (eski->yeni)
  const spark = snapsRaw.slice(0, 7).map(s => s.price).reverse();

  const Tab = ({ keyName }: { keyName: RangeKey }) => {
    const active = keyName === range;
    return (
      <Link
        href={`/p/${params.slug}?range=${keyName}`}
        style={{
          textDecoration: "none",
          fontWeight: 900,
          padding: "8px 12px",
          borderRadius: 999,
          border: "1px solid #eee",
          background: active ? "#111" : "#fff",
          color: active ? "#fff" : "#111",
          fontSize: 13,
        }}
      >
        {rangeLabel(keyName)}
      </Link>
    );
  };

  return (
    <main className="container">
      <Header q={q} />

      {/* küçük hero (sayfalarda aynı görsel şimdilik) */}
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
          <Link href="/" style={{ opacity: 0.85, textDecoration: "none" }}>← Ana sayfa</Link>

          <h1 style={{ fontSize: 28, fontWeight: 950, margin: "10px 0 0" }}>{product.title}</h1>

          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <Tab keyName="day" />
            <Tab keyName="week" />
            <Tab keyName="month" />
          </div>

          <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, opacity: 0.8 }}>Son hareket:</span>
            <span style={{ fontWeight: 900, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <TrendIcon deltaPct={deltaPct} /> {pct(deltaPct)}
            </span>
            <span style={{ opacity: 0.75 }}>•</span>
            <span style={{ opacity: 0.85 }}>{bikonomiYorumu(deltaPct)}</span>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 1, display: "grid", justifyItems: "end", alignContent: "center" }}>
          <div style={{ border: "1px solid #eee", background: "rgba(255,255,255,.85)", borderRadius: 18, padding: 10 }}>
            <div style={{ fontWeight: 900, fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Son 7 kayıt</div>
            <div style={{ opacity: 0.9 }}>
              <Sparkline values={spark.length ? spark : [today, today]} />
            </div>
          </div>
        </div>
      </section>

      {/* fiyat kutuları */}
      <section style={{ marginTop: 14, border: "1px solid #eee", borderRadius: 16, padding: 14, background: "#fff" }}>
        <div className="grid3" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          <div style={{ border: "1px solid #f0f0f0", borderRadius: 14, padding: 12 }}>
            <div style={{ opacity: 0.75, fontSize: 12 }}>Bugün</div>
            <div style={{ fontWeight: 950, fontSize: 20, marginTop: 4 }}>{fmtTRY(today)}</div>
          </div>

          <div style={{ border: "1px solid #f0f0f0", borderRadius: 14, padding: 12 }}>
            <div style={{ opacity: 0.75, fontSize: 12 }}>Referans ({rangeLabel(range)})</div>
            <div style={{ fontWeight: 900, fontSize: 18, marginTop: 4 }}>{fmtTRY(ref)}</div>
          </div>

          <div style={{ border: "1px solid #f0f0f0", borderRadius: 14, padding: 12 }}>
            <div style={{ opacity: 0.75, fontSize: 12 }}>Değişim</div>
            <div style={{ fontWeight: 950, fontSize: 18, marginTop: 4 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <TrendIcon deltaPct={deltaPct} /> {pct(deltaPct)}
              </span>
            </div>
          </div>
        </div>

        {/* en iyi fiyat */}
        {bestOffer?.url && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <MarketplaceBadge source={bestOffer.source} />
            <a
              href={bestOffer.url}
              target="_blank"
              rel="nofollow sponsored noopener"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid #ddd",
                background: "#fff",
                fontWeight: 900,
                textDecoration: "none",
              }}
            >
              En iyi fiyatı gör →
            </a>
          </div>
        )}

        {/* pazaryerleri */}
        <div style={{ marginTop: 14, fontWeight: 950 }}>🛒 Pazaryerleri</div>
        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
          {product.offers.length ? (
            product.offers
              .slice()
              .sort((a, b) => (a.price ?? 0) - (b.price ?? 0))
              .map((o) => (
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
              ))
          ) : (
            <div style={{ opacity: 0.7 }}>Henüz pazaryeri teklifi yok.</div>
          )}
        </div>

        {/* fiyat geçmişi */}
        <div style={{ marginTop: 14, fontWeight: 950 }}>
          🧾 Fiyat Geçmişi ({rangeLabel(range)} • {listCount})
        </div>

        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
          {picked.length ? (
            picked
              .slice(0, listCount)
              .map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px dashed #eee",
                    paddingBottom: 6,
                  }}
                >
                  <span style={{ opacity: 0.75 }}>
                    {labelForTarget(range, p.target)} • {dateTR(p.snap.capturedAt)}
                  </span>
                  <span style={{ fontWeight: 900 }}>{fmtTRY(p.snap.price)}</span>
                </div>
              ))
          ) : (
            <div style={{ opacity: 0.7 }}>Henüz fiyat geçmişi yok.</div>
          )}
        </div>
      </section>

      <footer style={{ opacity: 0.6, fontSize: 12, marginTop: 18 }}>
        © {new Date().getFullYear()} bikonomi • demo
      </footer>
    </main>
  );
}
