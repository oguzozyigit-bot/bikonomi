"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type FetchResult = {
  ok: boolean;
  title?: string | null;
  price?: number | null;
  currency?: string | null;
  rating?: number | null;
  ratingCount?: number | null;
  source?: string;
  error?: string;
};

export default function CheckClient() {
  const sp = useSearchParams();
  const url = sp.get("url") ?? "";

  const [data, setData] = useState<FetchResult>({ ok: false, error: "Link gelmedi" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!url) {
        setData({ ok: false, error: "Link gelmedi" });
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/fetch?url=${encodeURIComponent(url)}`, {
          cache: "no-store",
        });

        const text = await res.text();
        let json: any;
        try {
          json = JSON.parse(text);
        } catch {
          json = { ok: false, error: `API JSON dönmedi (HTTP ${res.status})` };
        }

        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) setData({ ok: false, error: "API çağrısı başarısız" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [url]);

  const rating = data.rating ?? 0;

  const decision = useMemo(() => {
    if (!data.ok) return "ALINMAZ";
    if (rating >= 4.5) return "ALINIR";
    if (rating >= 4.0) return "DİKKAT";
    return "ALINMAZ";
  }, [data.ok, rating]);

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#fff" }}>
      <div style={{ width: 420, maxWidth: "90vw", border: "1px solid #ddd", borderRadius: 12, padding: 20 }}>
        <h2 style={{ margin: 0, marginBottom: 12 }}>{decision}</h2>

        {loading && <p style={{ color: "#555" }}>Yükleniyor…</p>}

        {!loading && !data.ok && (
          <p style={{ color: "crimson" }}>{data.error ?? "API çağrısı başarısız"}</p>
        )}

        <p><b>Başlık:</b> {data.title ?? "—"}</p>
        <p><b>Fiyat:</b> {data.price ?? "—"} {data.currency ?? ""}</p>
        <p><b>Puan:</b> {data.rating ?? "—"} / 5</p>
        <p><b>Yorum:</b> {data.ratingCount ?? "—"}</p>
        <p><b>Kaynak:</b> {data.source ?? "—"}</p>

        <a
          href={url || "#"}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "block",
            marginTop: 16,
            padding: 12,
            background: "#16a34a",
            color: "#fff",
            textAlign: "center",
            borderRadius: 10,
            textDecoration: "none",
          }}
        >
          Ürüne Git
        </a>
      </div>
    </main>
  );
}
