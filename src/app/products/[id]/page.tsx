// app/products/[id]/page.tsx
import Link from "next/link";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ✅ MVP: Prisma yok, demo data var (build'i kaldırmak için)
  const demo = {
    id,
    title: `Ürün (Demo) • ${id}`,
    currency: "₺",
    cheapestPrice: 1249,
    cheapestStore: "A Mağazası",
    score: 82,
    offers: [
      { store: "A Mağazası", price: 1249, inStock: true, url: "#" },
      { store: "B Mağazası", price: 1399, inStock: true, url: "#" },
      { store: "C Mağazası", price: 1499, inStock: false, url: "#" },
    ],
  };

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <header className="mx-auto max-w-5xl px-4 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-zinc-900" />
          <div className="text-sm font-semibold">Bikonomi</div>
        </Link>
        <Link href="/" className="text-sm text-zinc-600 hover:text-zinc-900">
          Ana sayfa
        </Link>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-6">
        <div className="text-xs text-zinc-500">Ürün ID</div>
        <div className="mt-1 text-sm text-zinc-700">{demo.id}</div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2 rounded-3xl border border-zinc-200 p-6">
            <div className="text-xl font-semibold">{demo.title}</div>

            <div className="mt-4 grid gap-2">
              {demo.offers.map((o) => (
                <div
                  key={o.store}
                  className="rounded-2xl border border-zinc-200 p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-medium">{o.store}</div>
                    <div className="text-xs text-zinc-500">
                      {o.inStock ? "Stokta" : "Stok yok"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-lg font-semibold">
                      {demo.currency}
                      {o.price.toLocaleString("tr-TR")}
                    </div>
                    <a
                      href={o.url}
                      className="rounded-2xl bg-zinc-900 px-3 py-2 text-white text-sm"
                    >
                      Mağazaya git
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 p-6">
            <div className="text-sm text-zinc-500">En ucuz</div>
            <div className="mt-1 text-3xl font-semibold">
              {demo.currency}
              {demo.cheapestPrice.toLocaleString("tr-TR")}
            </div>
            <div className="mt-1 text-sm text-zinc-600">{demo.cheapestStore}</div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-zinc-500">Bikonomi Skoru</div>
                <div className="text-sm font-semibold">{demo.score}/100</div>
              </div>
              <div className="mt-2 h-2 rounded-full bg-zinc-100 overflow-hidden">
                <div className="h-2 bg-zinc-900" style={{ width: `${demo.score}%` }} />
              </div>
              <div className="mt-2 text-xs text-zinc-500">
                Bu sayfa MVP için demo. Gerçek veri birazdan bağlanacak.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm text-zinc-600">
          İpucu: Şu an asıl akış <code>/analyze</code> üzerinden çalışıyor.
        </div>
      </section>
    </main>
  );
}
