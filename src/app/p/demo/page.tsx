"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function DemoPage() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");

  const [title, setTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setError("URL bulunamadı");
      setLoading(false);
      return;
    }

    fetch(`/api/fetch?url=${encodeURIComponent(url)}`)
      .then(res => res.json())
      .then(data => {
        setTitle(
          data?.product?.title ||
          data?.title ||
          "Başlık bulunamadı"
        );
      })
      .catch(() => {
        setError("Ürün alınamadı");
      })
      .finally(() => setLoading(false));
  }, [url]);

  if (loading) return <div className="p-6">Yükleniyor…</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold">{title}</h1>
    </main>
  );
}

