"use client";

import { useEffect, useMemo, useState } from "react";
import { slugToTitle } from "@/lib/slugToTitle";

type Source = "trendyol" | "hepsiburada" | "amazon" | "unknown";

type FetchResult = {
  ok: boolean;
  url: string;
  source: Source;
  title: string | null;
  price: number | null;
  currency: "TRY" | "USD" | "EUR" | null;
  rating: number | null;
  ratingCount: number | null;
  error?: string;
};

export default function CheckClient({ slug, url }: { slug: string; url: string }) {
  const fallbackTitle = useMemo(() => slugToTitle(slug, { maxWords: 12 }), [slug]);

  const [data, setData] = useState<FetchResult>({
    ok: false,
    url: url || "",
    source: "unknown",
    title: null,
    price: null,
    currency: null,
    rating: null,
    ratingCount: null,
    error: url ? "Yükleniyor…" : "URL yok (linke ?url= ekle)",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!url) return;

      setLoading(true);
      try {
        const res = await fetch(`/api/fetch?url=${encodeURIComponent(url)}`, { cache: "no-store" });
        const json = (await res.json()) as FetchResult;
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) {
          setData((prev) => ({ ...prev, ok: false, error: "API çağrısı başarısız" }));
        }
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
    if (!data.ok && !loading) return "ALINMAZ";
    if (rating >= 4.5) return "ALINIR";
    if (rating >= 4.0) return "DİKKAT";
    return "ALINMAZ";
  }, [data.ok, loading, rating]);

  const score = useMemo(() => {
    const r = data.rating ?? 0;
    const rc = data.ratingCount ?? 0;
    const ratingScore = Math.max(0, Math.min(70, (r / 5) * 70));
    const trustScore = Math.max(0, Math.min(20, (Math.log10(rc + 1) / Math.log10(51)) * 20));
    const priceBonus = data.price != null ? 10 : 0;
    return Math.round(ratingScore + trustScore + priceBonus);
  }, [data.rating, data.ratingCount, data.price]);

  const explanations = useMemo(() => {
    return explainScore(score, data.price != null, data.rating, data.ratingCount);
  }, [score, data.price, data.rating, data.ratingCount]);

  const uiTitle = data.title || fallbackTitle || "Ürün";
  const priceText =
    data.price == null ? "—" : `${data.price.toLocaleString("tr-TR")} ${data.currency ?? ""}`.trim();

  return (
    <main style={{ minHeight: "100vh", background: "#fff" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
        <div
          style={{
            border: "1px solid #e5e5e5",
            borderRadius: 16,
            padding: 16,
            display: "grid",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: "#666" }}>
                Kaynak: <b>{data.source}</b>
              </div>

              <h1 style={{ margin: "6px 0 0", fontSize: 20 }}>{uiTitle}</h1>

              <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>
                Slug: <span style={{ fontFamily: "monospace" }}>{slug}</span>
              </div>
            </div>

            <div
              style={{
                minWidth: 220,
                textAlign: "right",
                padding: 12,
                borderRadius: 12,
                border: "1px solid #eee",
              }}
            >
              <div style={{ fontSize: 12, color: "#666" }}>Bikonomi Skoru</div>
              <div style={{ fontSize: 28, fontWeight: 900, lineHeight: 1 }}>{score}</div>

              <p style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
                Bu skor; fiyat, piyasa karşılaştırması ve güven sinyallerine göre 0–100 arası hesaplanır.
              </p>

              <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>Karar</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{decision}</div>

              <div style={{ marginTop: 10, fontSize: 12, color: "#666", display: "grid", gap: 4 }}>
                {explanations.map((t, i) => (
                  <div key={i}>• {t}</div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Card label="Fiyat" value={priceText} />
            <Card label="Puan" value={data.rating == null ? "—" : `${data.rating} / 5`} />
            <Card label="Yorum" value={data.ratingCount == null ? "—" : `${data.ratingCount}`} />
          </div>

          {loading && <p style={{ margin: 0, color: "#555" }}>Yükleniyor…</p>}
          {!loading && data.error && !data.ok && <p style={{ margin: 0, color: "crimson" }}>{data.error}</p>}

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a
              href={url || "#"}
              target="_blank"
              rel="noreferrer"
              style={{
                padding: "12px 14px",
                background: "#16a34a",
                color: "#fff",
                borderRadius: 12,
                textDecoration: "none",
                opacity: url ? 1 : 0.6,
                pointerEvents: url ? "auto" : "none",
              }}
            >
              Ürüne Git
            </a>

            <a
              href={"/"}
              style={{
                padding: "12px 14px",
                background: "#111827",
                color: "#fff",
                borderRadius: 12,
                textDecoration: "none",
              }}
            >
              Yeni Link Dene
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 12 }}>
      <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
      <div style={{ marginTop: 6, fontSize: 16, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

function explainScore(score: number, hasAutoPrice: boolean, rating: number | null, ratingCount: number | null) {
  const lines: string[] = [];

  if (hasAutoPrice) lines.push("Fiyat verisi bulundu, skor daha güvenilir.");
  else lines.push("Fiyat bulunamadı; skor rating/yorum ağırlıklı hesaplandı.");

  if (rating != null) {
    if ((ratingCount ?? 0) < 5) lines.push("Yorum az: güven puanı sınırlı.");
    else if (rating >= 4.5) lines.push("Memnuniyet çok yüksek.");
    else if (rating >= 4.0) lines.push("Memnuniyet iyi seviyede.");
  }

  if (score >= 85) lines.push("Genel: fiyat/performans güçlü.");
  else if (score >= 70) lines.push("Genel: temkinli şekilde tercih edilebilir.");
  else lines.push("Genel: alternatifleri karşılaştır.");

  return lines.slice(0, 2);
}
