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
function ProductVisual({ title }: { title: string }) {
  const initials = title.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 14,
        background: "linear-gradient(135deg,#2b59ff33,#ff7a0033)",
        display: "grid",
        placeItems: "center",
        fontWeight: 900,
      }}
    >
      {initials}
    </div>
  );
}

export default async function Home({ searchParams }: { searchParams: { q?: string } }) {
  const q = (searchParams?.q || "").trim();

  const products = await prisma.product.findMany({
    where: q ? { title: { contains: q, mode: "insensitive" } } : undefined,
    include: {
      offers: {
        take: 1,
        include: {
          // grafik için son 7 kayıt
          snapshots: { orderBy: { capturedAt: "desc" }, take: 7 },
        },
      },
    },
    take: 50,
    orderBy: { updatedAt: "desc" },
  });

  const rows = products
    .map((p) => {
      const o = p.offers[0];
      if (!o) return null;

      const snaps = o.snapshots || [];
      const today = snaps[0]?.price ?? o.price;
      const yesterday = snaps[1]?.price ?? today;
      const deltaPct = yesterday === 0 ? 0 : ((today - yesterday) / yesterday) * 100;

      // sparkline için eski->yeni sırala
      const spark = snaps.map(s => s.price).reverse();

      return { p, o, today, yesterday, deltaPct, spark };
    })
    .filter(Boolean) as any[];

  const artan = rows.filter(x => x.deltaPct > 0).slice(0, 6);
  const dusen = rows.filter(x => x.deltaPct < 0).slice(0, 6);
  const populer = [...rows].sort((a,b)=> (b.p.views ?? 0) - (a.p.views ?? 0)).slice(0, 6);

  const Card = ({ x }: { x: any }) => (
    <Link href={`/p/${x.p.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
      <div style={{ border: "1px solid #eee", borderRadius: 18, padding: 12, background: "#fff", boxShadow: "0 6px 18px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <ProductVisual title={x.p.title} />
            <div style={{ fontWeight: 950, lineHeight: 1.2 }}>{x.p.title}</div>
          </div>
          <div style={{ opacity: 0.85 }}>
            <Sparkline values={x.spark} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10, fontSize: 13 }}>
          <div><div style={{ opacity: 0.6 }}>Bugün</div><b>{fmtTRY(x.today)}</b></div>
          <div><div style={{ opacity: 0.6 }}>Dün</div>{fmtTRY(x.yesterday)}</div>
          <div style={{ textAlign: "right" }}>
            <div style={{ opacity: 0.6 }}>Değişim</div>
            <div style={{ fontWeight: 900, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <TrendIcon deltaPct={x.deltaPct} />
              {pct(x.deltaPct)}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <MarketplaceBadge source={x.o.source} />
          <a
            href={x.o.url || "#"}
            target="_blank"
            rel="nofollow sponsored noopener"
            style={{ fontWeight: 900, fontSize: 12, padding: "6px 10px", borderRadius: 999, border: "1px solid #eee", background: "#fff" }}
          >
            Mağazaya git →
          </a>
        </div>
      </div>
    </Link>
  );

  const Section = ({ title, list }: { title: string; list: any[] }) => (
    <section style={{ border: "1px solid #eee", borderRadius: 22, padding: 14, background: "#fff" }}>
      <h3 style={{ margin: "0 0 10px", fontWeight: 950 }}>{title}</h3>
      <div style={{ display: "grid", gap: 10 }}>
        {list.map((x:any) => <Card key={x.p.id} x={x} />)}
      </div>
    </section>
  );

  return (
    <main className="container">
      <Header q={q} />

      {/* hero (şimdilik aynı görsel) */}
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
        <div style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, rgba(255,255,255,.94) 0%, rgba(255,255,255,.72) 55%, rgba(255,255,255,.22) 100%)",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: 34, margin: 0, fontWeight: 950, letterSpacing: -0.4 }}>
            Fiyatı görme.<br />Fiyatı anla.
          </h1>
          <p style={{ opacity: 0.85, marginTop: 10 }}>
            Grafik her yerde. Arama her sayfada. Pazaryerleri tek ekranda.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <span style={{ border: "1px solid #eaeaea", background: "rgba(255,255,255,.85)", padding: "8px 10px", borderRadius: 999, fontSize: 13 }}>🔺 Artanlar</span>
            <span style={{ border: "1px solid #eaeaea", background: "rgba(255,255,255,.85)", padding: "8px 10px", borderRadius: 999, fontSize: 13 }}>🔻 Düşenler</span>
            <span style={{ border: "1px solid #eaeaea", background: "rgba(255,255,255,.85)", padding: "8px 10px", borderRadius: 999, fontSize: 13 }}>🔥 Popüler</span>
          </div>
        </div>
        <div />
      </section>

      <div className="grid3" style={{ marginTop: 16 }}>
        <Section title="Fiyatı Artanlar" list={artan} />
        <Section title="Fiyatı Düşenler" list={dusen} />
        <Section title="Popüler Ürünler" list={populer} />
      </div>

      <footer style={{ opacity: 0.6, fontSize: 12, marginTop: 18 }}>
        © {new Date().getFullYear()} bikonomi • demo
      </footer>
    </main>
  );
}
