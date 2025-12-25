"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type FetchResult = {
  ok?: boolean;
  source?: string;
  title?: string;
  product?: {
    title?: string;
    price?: number | string;
    currency?: string;
    url?: string;
    image?: string;
  };
  score?: number;
};

function formatPrice(price: unknown, currency: string) {
  if (price === null || price === undefined) return null;

  // String gelirse (ör: "1.299,90") olduğu gibi yaz, sadece currency ekle
  if (typeof price === "string") {
    const p = price.trim();
    if (!p) return null;
    return `${p} ${currency}`;
  }

  if (typeof price === "number" && Number.isFinite(price)) {
    try {
      return new Intl.NumberFormat("tr-TR", {
        maximumFractionDigits: 2,
      }).format(price) + ` ${currency}`;
    } catch {
      return `${price} ${currency}`;
    }
  }

  return null;
}

export default function DemoPage() {
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
    const t = setTimeout(() => controller.abort(), 15000);

    fetch(`/api/fetch?url=${encodeURIComponent(url)}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((json: FetchResult) => {
        setData(json);
      })
      .catch((e) => {
        setError(e?.name === "AbortError" ? "Zaman aşımı (15sn)" : "Ürün alınamadı");
      })
      .finally(() => {
        clearTimeout(t);
        setLoading(false);
      });

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [url]);

  const source = (data?.source || "KAYNAK").toUpperCase();
  const title =
    data?.product?.title ||
    data?.title ||
    "Başlık bulunamadı";

  const productUrl = data?.product?.url || url || undefined;
  const currency = data?.product?.currency || "TRY";
  const priceText = useMemo(
    () => formatPrice(data?.product?.price, currency),
    [data?.product?.price, currency]
  );

  const score = typeof data?.score === "number" ? data!.score : null;

  if (loading) return <div className="p-6">Yükleniyor…</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <main className="min-h-[60vh] p-6 flex items-start justify-center">
      <div className="w-full
