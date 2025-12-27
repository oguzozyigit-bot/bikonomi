import LogoLock from "@/components/LogoLock";
import PriceChartMini from "@/components/PriceChartMini";

type Offer = {
  store: "Trendyol" | "Hepsiburada" | "Amazon";
  price: number;
  shipping: number;
  inStock: boolean;
  url: string;
};

type ApiResponse = {
  source: string;
  url: string;
  product: {
    title: string;
    image: string;
    score: number;
    breakdown: { priceScore: number; marketScore: number; trustScore: number };
    history: number[];
    offers: Offer[];
  };
};

function formatTRY(n: number) {
  return n.toLocaleString("tr-TR");
}

// ✅ Server component: absolute URL şart
function getBaseUrl() {
  // Vercel prod/preview
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  // Local (Windows / Next dev)
  return "http://localhost:3000";
}

export default async function AnalyzePage({
  searchParams,
}: {
  searchParams: Promise<{ u?: string }> | { u?: string };
}) {
  const sp = await Promise.resolve(searchParams);
  const raw = sp?.u || "";

  const base = getBaseUrl();
  const apiUrl = new URL("/api/analyze", base);
  apiUrl.searchParams.set("u", raw);

  const res = await fetch(apiUrl.toString(), { cache: "no-store" });

  if (!res.ok) {
    return (
      <main className="min-h-screen bg-[#0b0f14] text-white">
        <div className="mx-auto max-w-3xl px-5 py-8">
          <div className="flex items-start justify-between gap-4">
            <LogoLock />
            <a
              href="/"
              className="text-xs text-white/60 hover:text-white underline underline-offset-4"
            >
              Yeni analiz
            </a>
          </div>

          <div className="mt-6 rounded-3xl border border-rose-400/20 bg-rose-400/10 p-5">
            <div className="text-sm font-semibold">Analiz başarısız</div>
            <div className="mt-1 text-sm text-rose-100/90">
              API yanıt vermedi. (HTTP {res.status})
            </div>
            <div className="mt-2 text-xs text-white/50 break-all">
              İstek: {apiUrl.toString()}
            </div>
          </div>
        </div>
      </main>
    );
  }

  const data = (await res.json()) as ApiResponse;
  const product = data.product;

  const cheapest = product.offers
    .filter((o) => o.inStock)
    .map((o) => ({ ...o, total: o.price + o.shipping }))
    .sort((a, b) => a.total - b.total)[0];

  return (
    <main className="min-h-screen bg-[#0b0f14] text-white">
      <div className="mx-auto max-w-3xl px-5 py-8">
        <div className="flex items-start justify-between gap-4">
          <LogoLock />
          <a
            href="/"
            className="text-xs text-white/60 hover:text-white underline underline-offset-4"
          >
            Yeni analiz
          </a>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs">
          Kaynak: <b className="uppercase">{data.source}</b>{" "}
          <span className="text-white/50">—</span>{" "}
          <span className="text-white/70 break-all">{data.url}</span>
        </div>

        {/* Ürün kartı */}
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-[140px_1fr] rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/30">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image}
              alt={product.title}
              className="h-[140px] w-full object-cover"
            />
          </div>

          <div>
            <div className="text-xs text-white/50">Ürün</div>
            <h1 className="mt-1 text-xl font-semibold leading-snug">
              {product.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                <div className="text-[11px] text-white/50">En ucuz</div>
                <div className="text-sm font-semibold">
                  {formatTRY(cheapest.total)} ₺{" "}
                  <span className="text-white/50 text-xs">
                    ({cheapest.store})
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                <div className="text-[11px] text-white/50">Stok</div>
                <div className="text-sm font-semibold text-emerald-300">Var</div>
              </div>
            </div>
          </div>
        </div>

        {/* Skor + Grafik */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-medium">Bikonomi Skoru</div>
            <div className="mt-4 flex items-center gap-4">
              <div className="h-20 w-20 rounded-full border border-white/10 bg-black/25 grid place-items-center">
                <div className="text-2xl font-bold">{product.score}</div>
              </div>
              <div className="text-sm text-white/70">
                Artık bu sayfa API’den besleniyor ✅
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <MiniBreak title="Fiyat" value={product.breakdown.priceScore} />
              <MiniBreak title="Piyasa" value={product.breakdown.marketScore} />
              <MiniBreak title="Güven" value={product.breakdown.trustScore} />
            </div>
          </div>

          <PriceChartMini points={product.history} />
        </div>

        {/* Mağazalar */}
        <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Mağazalar</div>
            <div className="text-xs text-white/50">
              Fiyat + kargo dahil gösterim
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {product.offers.map((o) => (
              <OfferRow key={o.store} offer={o} cheapestStore={cheapest.store} />
            ))}
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-white/35">
          UI → /api/analyze ✅
        </div>
      </div>
    </main>
  );
}

function MiniBreak({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="text-[11px] text-white/50">{title}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}

function OfferRow({
  offer,
  cheapestStore,
}: {
  offer: Offer;
  cheapestStore: Offer["store"];
}) {
  const total = offer.price + offer.shipping;
  const isCheapest = offer.store === cheapestStore;

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold">{offer.store}</div>
          {isCheapest ? (
            <span className="text-[11px] rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-0.5 text-emerald-200">
              En ucuz
            </span>
          ) : null}
        </div>

        <div className="mt-0.5 text-xs text-white/55">
          Ürün: {offer.price.toLocaleString("tr-TR")} ₺
          {offer.shipping > 0
            ? ` + Kargo: ${offer.shipping.toLocaleString("tr-TR")} ₺`
            : " + Ücretsiz kargo"}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-sm font-semibold whitespace-nowrap">
          {total.toLocaleString("tr-TR")} ₺
        </div>
        <a
          href={offer.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black"
        >
          Git
        </a>
      </div>
    </div>
  );
}
