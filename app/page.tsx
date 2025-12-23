// app/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import LinkPasteBox from "@/components/LinkPasteBox";

function badgeText(score: number) {
  if (score >= 85) return "Çok Mantıklı";
  if (score >= 70) return "Mantıklı Seçim";
  if (score >= 50) return "Düşünülebilir";
  return "Mantıksız";
}

export default async function HomePage() {
  const items = await prisma.product.findMany({
    orderBy: { score: "desc" },
    take: 6,
    where: { score: { gte: 70 } },
    select: {
      id: true,
      title: true,
      score: true,
      cheapestPrice: true,
    },
  });

  const firstId = items?.[0]?.id ?? "p1";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      {/* HERO */}
      <section className="rounded-3xl border bg-white p-8 shadow-sm">
        {/* Link yapıştır alanı (client component) */}
        <div className="max-w-2xl">
          <LinkPasteBox />

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/products/${firstId}`}
              className="rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Ürünü gör
            </Link>

            <a
              href="#today"
              className="rounded-2xl border px-4 py-2 text-sm font-semibold text-gray-900"
            >
              Bugün mantıklı olanlar
            </a>
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
          {items.map((p) => (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="group rounded-3xl border bg-white p-4 shadow-sm hover:shadow-md"
            >
              <div className="relative aspect-[3/2] overflow-hidden rounded-2xl bg-gray-100">
                <img
                  src={`https://picsum.photos/seed/${encodeURIComponent(
                    p.id
                  )}/600/400`}
                  alt={p.title}
                  className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]"
                  loading="lazy"
                />
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-gray-900">
                    {p.title}
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    {Number(p.cheapestPrice).toLocaleString("tr-TR")} ₺
                  </div>
                </div>

                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                  {p.score} · {badgeText(p.score)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
