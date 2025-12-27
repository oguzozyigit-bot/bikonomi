"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { slugToTitle } from "@/lib/slugToTitle";

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

function deriveTitleFromUrl(u: string) {
  try {
    const parsed = new URL(u);
    const last = parsed.pathname.split("/").filter(Boolean).pop() || "";
    return slugToTitle(last, { maxWords: 12 });
  } catch {
    return "";
  }
}

export default function CheckClient() {
  const sp = useSearchParams();
  const url = (sp.get("url") ?? "").trim();

  // URL'den anında okunur başlık (API gelmeden önce ekranda kullanacağız)
  const fallbackTitle = useMemo(() => deriveTitleFromUrl(url), [url]);

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

  // Ekranda başlık: API title varsa onu bas, yoksa slug'dan üretilen fallback
  const uiTitle = data.title || fallbackTitle || "—";

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#fff" }}>
      <div style={{ width: 420, maxWidth: "90vw", border: "1px solid #ddd", borderRadius: 12, padding: 20 }}>
        <h2 style={{ margin: 0, marginBottom: 12 }}>{decision}</h2>

        {loading && <p style={{ color: "#555" }}>Yükleniyor…</p>}

        {!loading && !data.ok && (
          <p style={{ color: "crimson" }}>{data.error ?? "API çağrısı başarısız"}</p>
        )}

        <p><b>Başlık:</b> {uiTitle}</p>
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
            pointerEvents: url ? "auto" : "none",
            opacity: url ? 1 : 0.6,
          }}
        >
          Ürüne Git
        </a>
      </div>
    </main>
  );
}
function explainScore({
  score,
  priceUsed,
  rating,
  ratingCount,
}: {
  score: number;
  priceUsed: "auto" | "manual";
  rating: number | null;
  ratingCount: number | null;
}) {
  const lines: string[] = [];

  if (priceUsed === "manual") {
    lines.push("Fiyat bilgisi manuel girildiği için karşılaştırma sınırlı.");
  } else {
    lines.push("Fiyat piyasa verileriyle otomatik karşılaştırıldı.");
  }

  if (rating != null) {
    if ((ratingCount ?? 0) < 5) {
      lines.push("Yorum sayısı az olduğu için güven puanı bir miktar kırıldı.");
    } else if (rating >= 4.5) {
      lines.push("Kullanıcı memnuniyeti oldukça yüksek.");
    } else if (rating >= 4.0) {
      lines.push("Kullanıcı memnuniyeti iyi seviyede.");
    }
  }

  if (score >= 85) {
    lines.push("Genel değerlendirme: fiyat/performans açısından güçlü.");
  } else if (score >= 70) {
    lines.push("Genel değerlendirme: temkinli şekilde tercih edilebilir.");
  } else {
    lines.push("Genel değerlendirme: alternatifleri karşılaştırmak faydalı.");
  }

  return lines.slice(0, 2); // sadece 2 satır
}
