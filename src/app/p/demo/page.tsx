"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type FetchResult = {
  source?: string;
  title?: string;
  product?: {
    title?: string;
    price?: number | string | null;
    currency?: string;
    url?: string;
    image?: string;
  };
  score?: number;
};

function fixUrl(u?: string | null) {
  if (!u) return undefined;
  if (u.startsWith("//")) return `https:${u}`;
  return u;
}

function formatPrice(price: unknown, currency: string) {
  if (price === null || price === undefined) return null;

  // "1.299,90" gibi string gelirse aynen yaz
  if (typeof price === "string") {
    const p = price.trim();
    if (!p) return null;
    return `${p} ${currency}`;
  }

  if (typeof price === "number" && Number.isFinite(price)) {
    try {
      return (
        new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 2 }).format(price) +
        ` ${currency}`
      );
    } catch {
      return `${price} ${currency}`;
    }
  }

  return null;
}

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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    fetch(`/api/fetch?url=${encodeURIComponent(url)}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((json: FetchResult) => {
        setData(json);
      })
      .catch((e) => {
        setError(e?.name === "AbortError" ? "Zaman aşımı (15sn)" : "Ürün alınamadı");
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [url]);

  if (loading) return <div className="p-6">Yükleniyor…</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  const source = (data?.source || "KAYNAK").toUpperCase();
  const title = data?.product?.title || data?.title || "Başlık bulunamadı";

  const currency = data?.product?.currency || "TRY";
  const priceText = useMemo(
    () => formatPrice(data?.product?.price, currency),
    [data?.product?.price, currency]
  );

  const productUrl = data?.product?.url || url || "#";
  const imageUrl = fixUrl(data?.product?.image);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const score = typeof data?.score === "number" ? data.score : null;

  return (
    <main className="min-h-[60vh] p-6 flex items-start justify-center">
      <div className="w-full max-w-3xl border rounded-2xl p-6">
        <div className="text-xs tracking-widest text-zinc-500">{source}</div>

        <h1 className="mt-2 text-2xl font-bold leading-tight">{title}</h1>

        {imageUrl ? (
          // next/image yerine img: remote domain ayarı istemez
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={title}
            className="mt-4 w-full max-h-[320px] object-contain rounded-xl border bg-white"
            loading="lazy"
          />
        ) : null}

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border rounded-xl p-4">
            <div className="text-xs text-zinc-500 mb-2">Fiyat</div>
            <div className="text-xl font-semibold">{priceText ?? "—"}</div>
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

        <div className="mt-3 text-xs text-zinc-400 break-all">{productUrl}</div>
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
