// src/app/p/demo/page.tsx
export const dynamic = "force-dynamic"; // cache yüzünden eski veri görmeyelim

type PageProps = {
  searchParams?: { url?: string };
};

export default async function DemoPage({ searchParams }: PageProps) {
  const raw = (searchParams?.url || "").trim();

  if (!raw) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-xl font-semibold">Demo</h1>
        <p className="mt-2 opacity-80">URL yok. /p/demo?url=... ile gel.</p>
      </main>
    );
  }

  const apiUrl = `/api/fetch?url=${encodeURIComponent(raw)}`;

  let title = "Başlık bulunamadı";
  let source = "";
  let price: any = null;
  let currency = "TRY";
  let rating: any = null;
  let ratingCount: any = null;

  try {
    const res = await fetch(apiUrl, { cache: "no-store" });
    const json = await res.json();
    const d = json?.data;

    title = d?.title || title;
    source = d?.source || "";
    price = d?.price ?? null;
    currency = d?.currency || currency;
    rating = d?.rating ?? null;
    ratingCount = d?.ratingCount ?? null;
  } catch {
    // sessiz geç
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="rounded-2xl border bg-white p-5">
        <div className="text-sm opacity-70">{source ? source.toUpperCase() : "KAYNAK"}</div>
        <h1 className="mt-2 text-xl font-semibold">{title}</h1>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border p-3">
            <div className="text-xs opacity-60">Fiyat</div>
            <div className="mt-1 text-lg font-semibold">
              {price ?? "—"} {currency}
            </div>
          </div>

          <div className="rounded-xl border p-3">
            <div className="text-xs opacity-60">Puan</div>
            <div className="mt-1 text-lg font-semibold">
              {rating ?? "—"} <span className="text-sm opacity-70">({ratingCount ?? "—"})</span>
            </div>
          </div>
        </div>

        <a className="mt-4 inline-block underline" href={raw} target="_blank" rel="noreferrer">
          Ürüne git
        </a>
      </div>
    </main>
  );
}
