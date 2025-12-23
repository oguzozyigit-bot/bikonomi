"use client";

import { useEffect, useState } from "react";

type Analysis = {
  title: string;
  cheapestPrice: number;
  currency: string;
  cheapestStore: string;
  score: number;
  offers: { store: string; price: number; inStock: boolean; url: string }[];
};

export default function AnalyzeClient({ url }: { url: string }) {
  const [data, setData] = useState<Analysis | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setErr(null);
      setData(null);

      if (!url) {
        setErr("Link bulunamadı. Ana sayfaya dönüp tekrar deneyin.");
        return;
      }

      try {
        const res = await fetch(`/api/analyze?url=${encodeURIComponent(url)}`, { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error || "Analiz başarısız");
        setData(json);
      } catch (e: any) {
        setErr(e?.message || "Bir hata oluştu.");
      }
    })();
  }, [url]);

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <header className="mx-auto max-w-5xl px-4 py-5 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-zinc-900" />
          <div className="text-sm font-semibold">Bikonomi</div>
        </a>
        <a href="/" className="text-sm text-zinc-600 hover:text-zinc-900">Ana sayfa</a>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-6">
        <div className="text-xs text-zinc-500">Analiz edilen link</div>
        <div className="mt-1 break-all text-sm text-zinc-700">{url}</div>

        {!data && !err && (
          <div className="mt-6 rounded-3xl border border-zinc-200 p-6">
            <div className="text-lg font-semibold">Analiz yapılıyor…</div>
            <div className="mt-2 text-sm text-zinc-600">İzinli site kontrolü + demo veri hazırlanıyor.</div>
          </div>
        )}

        {err && (
          <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
            <div className="text-lg font-semibold">Olmadı 😅</div>
            <div className="mt-2 text-sm">{err}</div>
            <a href="/" className="mt-4 inline-block rounded-2xl bg-zinc-900 px-4 py-2 text-white text-sm">
              Ana sayfaya dön
            </a>
          </div>
        )}

        {data && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 rounded-3xl border border-zinc-200 p-6">
              <div className="text-xl font-semibold">{data.title}</div>
              <div className="mt-3 grid gap-2">
                {data.offers.map((o) => (
                  <div key={o.store} className="rounded-2xl border border-zinc-200 p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{o.store}</div>
                      <div className="text-xs text-zinc-500">{o.inStock ? "Stokta" : "Stok yok"}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-semibold">
                        {data.currency}{o.price.toLocaleString("tr-TR")}
                      </div>
                      <a
                        href={o.url}
                        target="_blank"
                        className="rounded-2xl bg-zinc-900 px-3 py-2 text-white text-sm"
                        rel="noreferrer"
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
                {data.currency}{data.cheapestPrice.toLocaleString("tr-TR")}
              </div>
              <div className="mt-1 text-sm text-zinc-600">{data.cheapestStore}</div>

              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-zinc-500">Bikonomi Skoru</div>
                  <div className="text-sm font-semibold">{data.score}/100</div>
                </div>
                <div className="mt-2 h-2 rounded-full bg-zinc-100 overflow-hidden">
                  <div className="h-2 bg-zinc-900" style={{ width: `${data.score}%` }} />
                </div>
                <div className="mt-2 text-xs text-zinc-500">
                  Skor; fiyat, mağaza güveni ve piyasa ortalamasına göre hesaplanır.
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
