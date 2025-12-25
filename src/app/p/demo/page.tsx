// src/app/p/demo/page.tsx
export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: { url?: string };
};

export default async function DemoPage({ searchParams }: PageProps) {
  const rawUrl = (searchParams?.url || "").trim();

  // ✅ DEBUG MARKER: Bu yazıyı görmüyorsan, canlıda eski kod çalışıyor demektir.
  const debugStamp = new Date().toISOString();

  if (!rawUrl) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div
          style={{
            padding: 12,
            border: "2px solid red",
            marginBottom: 12,
            borderRadius: 12,
            fontFamily: "ui-sans-serif, system-ui",
          }}
        >
          NEW DEMO V2 — {debugStamp}
        </div>

        <div className="rounded-2xl border bg-white p-6">
          <h1 className="text-xl font-semibold">Bikonomi</h1>
          <p className="mt-2 opacity-70">
            URL yok. /p/demo?url=... ile gel.
          </p>
        </div>
      </main>
    );
  }

  // API çağrısı
  let data: any = null;
  let err = "";

  try {
    const res = await fetch(
      `/api/fetch?url=${encodeURIComponent(rawUrl)}`,
      { cache: "no-store" }
    );
    const json = await res.json();
    if (!json?.ok) throw new Error("API ok değil");
    data = json.data;
  } catch (e: any) {
    err = e?.message || "Bir hata oluştu";
  }

  const title = data?.title || "Başlık alınamadı";
  const source = data?.source || "kaynak";
  const price = data?.price ?? null;
  const currency = data?.currency || "TRY";
  const rating = data?.rating ?? null;
  const ratingCount = data?.ratingCount ?? null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* ✅ DEBUG MARKER */}
      <div
        style={{
          padding: 12,
          border: "2px solid red",
          marginBottom: 12,
          borderRadius: 12,
          fontFamily: "ui-sans-serif, system-ui",
        }}
      >
        NEW DEMO V2 — {debugStamp}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl border bg-white" />
          <div className="text-lg font-semibold">
            Bikonomi<span className="text-green-600">.</span>
          </div>
        </div>

        <a
          href="/"
          className="rounded-xl border bg-white px-3 py-2 text-sm hover:bg-gray-50"
        >
          Yeni arama
        </a>
      </div>

      {/* Error */}
      {err && (
        <div className="mt-4 rounded-2xl border bg-white p-5">
          <div className="text-sm font-medium text-red-600">Hata</div>
          <div className="mt-1 text-sm opacity-80">{err}</div>
        </div>
      )}

      {/* Product Card */}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-xs uppercase tracking-wide opacity-60">
            {String(source).toUpperCase()}
          </div>

          <h1 className="mt-2 text-xl font-semibold leading-snug">
            {title}
          </h1>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl border p-3">
              <div className="text-xs opacity-60">Fiyat</div>
              <div className="mt-1 text-lg font-semibold">
                {price === null ? "—" : price} {currency}
              </div>
            </div>

            <div className="rounded-xl border p-3">
              <div className="text-xs opacity-60">Puan</div>
              <div className="mt-1 text-lg font-semibold">
                {rating === null ? "—" : rating}
                <span className="text-sm opacity-70">
                  {" "}
                  ({ratingCount === null ? "—" : ratingCount})
                </span>
              </div>
            </div>
          </div>

          <a
            href={data?.url || rawUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700"
          >
            Ürüne git <span aria-hidden>→</span>
          </a>
        </div>

        {/* Right panel */}
        <div className="rounded-2xl border bg-white p-6">
          <div className="text-sm font-semibold">Gelen URL</div>
          <div className="mt-2 break-all rounded-xl border bg-gray-50 p-3 text-xs">
            {rawUrl}
          </div>

          <div className="mt-4 text-sm font-semibold">API Durumu</div>
          <div className="mt-2 rounded-xl border bg-gray-50 p-3 text-xs">
            {data ? "✅ Veri geldi" : "⏳ Veri yok / hata var"}
          </div>

          <div className="mt-4 text-xs opacity-60">
            Eğer bu sayfada NEW DEMO V2 yazısını görmüyorsan, canlıda eski deploy
            gösteriliyor demektir.
          </div>
        </div>
      </div>
    </main>
  );
}
