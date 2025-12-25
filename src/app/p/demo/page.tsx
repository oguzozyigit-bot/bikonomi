// src/app/p/demo/page.tsx
export const dynamic = "force-dynamic";

import { fetchByUrl } from "@/lib/fetchByUrl"; // ✅ sende var: tek giriş noktası

type PageProps = {
  searchParams?: { url?: string };
};

export default async function DemoPage({ searchParams }: PageProps) {
  const rawUrl = (searchParams?.url || "").trim();

  if (!rawUrl) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Bikonomi</h1>
        <p className="mt-2 opacity-70">URL yok. /p/demo?url=... ile gel.</p>
      </main>
    );
  }

  let data: any = null;
  let err = "";

  try {
    // ✅ Artık kendi API’nı çağırmıyoruz. Direkt motoru çağırıyoruz.
    const res = await fetchByUrl(rawUrl);
    // fetchByUrl yapısına göre:
    // - bazen { ok:true, data:{...} } döndürür
    // - bazen direkt { ... } döndürür
    data = (res as any)?.data ?? res;
  } catch (e: any) {
    err = e?.message || "Sunucu hatası";
  }

  const title = data?.title || "Başlık alınamadı";
  const source = data?.source || "kaynak";
  const price = data?.price ?? null;
  const currency = data?.currency || "TRY";
  const rating = data?.rating ?? null;
  const ratingCount = data?.ratingCount ?? null;
  const outUrl = data?.url || rawUrl;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="rounded-2xl border bg-white p-5">
        <div className="text-sm opacity-60">{String(source).toUpperCase()}</div>

        <h1 className="mt-2 text-xl font-semibold">{title}</h1>

        {err && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}

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

        <a
          href={outUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700"
        >
          Ürüne Git →
        </a>
      </div>
    </main>
  );
}
