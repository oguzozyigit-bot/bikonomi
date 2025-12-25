"use client";

import { useEffect, useState } from "react";

type FetchResp = {
  source?: string;
  product?: {
    title?: string;
    price?: number | null;
    currency?: string;
    url?: string;
    image?: string | null;
  };
  error?: string;
  message?: string;
};

export default function DemoPage({
  searchParams,
}: {
  searchParams: { url?: string };
}) {
  const url = searchParams?.url;
  const [data, setData] = useState<FetchResp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    fetch(`/api/fetch?url=${encodeURIComponent(url)}`)
      .then((r) => r.json())
      .then((j) => setData(j))
      .catch((e) => setData({ error: e?.message ?? "fetch failed" }))
      .finally(() => setLoading(false));
  }, [url]);

  if (!url) return <div style={{ padding: 24 }}>URL yok</div>;
  if (loading) return <div style={{ padding: 24 }}>Yükleniyor…</div>;

  const p = data?.product;

  return (
    <main style={{ padding: 24, maxWidth: 900 }}>
      <h1>Bikonomi Demo</h1>

      {!p ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <div style={{ border: "1px solid #ddd", padding: 16 }}>
          <h2>{p.title}</h2>

          <p>
            Fiyat:{" "}
            {typeof p.price === "number"
              ? `${p.price.toFixed(2)} ${p.currency ?? "TRY"}`
              : "—"}
          </p>

          {p.image && (
            <img src={p.image} style={{ maxWidth: 220 }} />
          )}

          <p style={{ fontSize: 12 }}>Kaynak: {data?.source}</p>

          <a href={p.url} target="_blank" rel="noreferrer">
            Ürüne git →
          </a>
        </div>
      )}
    </main>
  );
}
