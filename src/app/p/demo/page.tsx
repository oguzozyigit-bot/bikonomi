"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type FetchResult = {
  source?: string;
  title?: string;
  product?: {
    title?: string;
    price?: number | string;
    currency?: string;
    url?: string;
  };
};

function DemoInner() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");

  const [data, setData] = useState<FetchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setError("URL bulunamadı");
      setLoading(false);
      return;
    }

    fetch(`/api/fetch?url=${encodeURIComponent(url)}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setError("Ürün alınamadı"))
      .finally(() => setLoading(false));
  }, [url]);

  if (loading) return <div className="p-6">Yükleniyor…</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  const title = data?.product?.title || data?.title || "Başlık bulunamadı";
  const price = data?.product?.price
    ? `${data.product.price} ${data.product.currency || "TRY"}`
    : "—";
  const productUrl = data?.product?.url || url || "#";

  return (
    <main className="min-h-[60vh] p-6 flex items-start justify-center">
      <div className="w-full max-w-3xl border rounded-2xl p-6">
        <div className="text-xs tracking-widest text-zinc-500">
          {(data?.source || "KAYNAK").toUpperCase()}
        </div>

        <h1 className="mt-2 text-2xl font-bold">{title}</h1>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-2">Fiyat</div>
            <div className="text-xl font-semibold">{price}</div>
          </div>

          <div className="border rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-2">Puan</div>
            <div className="text-xl font-semibold">—</div>
          </div>
        </div>

        <div className="mt-5">
          <a
            href={productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center rounded-xl py-3 font-semibold bg-green-600 text-white hover:bg-green-700 transition"
          >
            Ürüne Git →
          </a>
        </div>
      </div>
    </main>
  );
}

export default function DemoPage() {
  return (
    <Suspense fallback={<div className="p-6">Yükleniyor…</div>}>
      <DemoInner />
    </Suspense>
  );
}
