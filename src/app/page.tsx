import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 pt-20 pb-16">
        {/* Üst başlık */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">Bikonomi</h1>
          <p className="mt-2 text-sm text-black/60">
            Linki yapıştır, 8 saniyede fiyat-güven kararını gör.
          </p>
        </div>

        {/* Arama kutusu */}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <form action="/check" className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              name="url"
              className="h-12 w-full rounded-xl border px-4 outline-none focus:ring-2 focus:ring-black/10"
              placeholder="Ürün linkini yapıştır"
            />
            <button
              type="submit"
              className="h-12 rounded-xl border px-5 font-medium hover:bg-black/5"
            >
              Analiz Et
            </button>
          </form>

          {/* Durum kartları */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border p-4 text-center">
              <div className="text-2xl">⛔</div>
              <div className="mt-1 font-semibold">ALINMAZ</div>
              <div className="mt-1 text-xs text-black/60">
                Risk yüksek / güven düşük
              </div>
            </div>
            <div className="rounded-xl border p-4 text-center">
              <div className="text-2xl">⚠️</div>
              <div className="mt-1 font-semibold">DİKKAT</div>
              <div className="mt-1 text-xs text-black/60">
                Alternatiflere bak
              </div>
            </div>
            <div className="rounded-xl border p-4 text-center">
              <div className="text-2xl">✅</div>
              <div className="mt-1 font-semibold">ALINIR</div>
              <div className="mt-1 text-xs text-black/60">
                Memnuniyet yüksek
              </div>
            </div>
          </div>

          {/* Mini alt link */}
          <div className="mt-5 text-center text-xs text-black/60">
            Direkt görmek için:{" "}
            <Link className="underline" href="/check">
              /check
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
