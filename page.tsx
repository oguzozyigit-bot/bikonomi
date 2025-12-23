import Link from "next/link";
import Image from "next/image";
import { getFeaturedProducts } from "@/lib/products";
import { ScoreBadge } from "@/components/score/scoreBadge";

export default function HomePage() {
  const featured = getFeaturedProducts();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* HERO */}
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Fiyatı değil, değeri karşılaştır.
          </h1>
          <p className="mt-3 text-gray-600">
            Bikonomi, ürünleri fiyat, güven ve kalite verilerine göre puanlar. En ucuzu değil, en mantıklıyı gösterir.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/products/ld-002" className="rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
              Ürünü analiz et
            </Link>
            <a href="#today" className="rounded-2xl border px-4 py-2 text-sm font-semibold text-gray-900">
              Bugün mantıklı olanlar
            </a>
          </div>
        </div>

        {/* How it works */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-gray-50 p-4">
            <div className="text-sm font-semibold">1) Fiyat verisi</div>
            <div className="mt-1 text-sm text-gray-600">En ucuz, medyan, satıcı sayısı</div>
          </div>
          <div className="rounded-2xl border bg-gray-50 p-4">
            <div className="text-sm font-semibold">2) Güven verisi</div>
            <div className="mt-1 text-sm text-gray-600">Stok, satıcı sinyalleri, tutarlılık</div>
          </div>
          <div className="rounded-2xl border bg-gray-50 p-4">
            <div className="text-sm font-semibold">3) Yapay zeka yorumu</div>
            <div className="mt-1 text-sm text-gray-600">Tek paragraf, net karar dili</div>
          </div>
        </div>
      </section>

      {/* TODAY */}
      <section id="today" className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-xl font-bold">Bugün Mantıklı Olanlar</h2>
          <span className="text-sm text-gray-500">Score’a göre seçilmiş</span>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <Link key={p.id} href={`/products/${p.id}`} className="group rounded-3xl border bg-white p-4 shadow-sm hover:shadow-md">
              <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-gray-100">
                <Image src={p.imageUrl} alt={p.title} fill className="object-cover transition-transform group-hover:scale-[1.02]" />
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-gray-900">{p.title}</div>
                  <div className="mt-1 text-sm text-gray-600">{p.cheapestPrice.toLocaleString("tr-TR")} ₺</div>
                </div>
                <ScoreBadge score={p.score} />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
