"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { slugToTitle } from "@/lib/slugToTitle";

function toSlugFromUrl(u: string) {
  try {
    const url = new URL(u);
    const last = url.pathname.split("/").filter(Boolean).pop() || "urun";
    // başlığa çevirip tekrar slug gibi kullanmak yerine,
    // doğrudan path parçasını kullanıyoruz (daha stabil)
    return last;
  } catch {
    return "";
  }
}

export default function HomeClient() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");

  const previewTitle = useMemo(() => {
    const slug = toSlugFromUrl(url.trim());
    return slug ? slugToTitle(slug, { maxWords: 12 }) : "";
  }, [url]);

  function onAnalyze() {
    const u = url.trim();
    if (!u) return setErr("Link yapıştır.");
    try {
      // validasyon
      new URL(u);
    } catch {
      return setErr("Geçerli bir link değil.");
    }

    setErr("");
    const slug = toSlugFromUrl(u) || "urun";
    router.push(`/p/${encodeURIComponent(slug)}?url=${encodeURIComponent(u)}`);
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#0b1220" }}>
      <div style={{ width: 720, maxWidth: "92vw", padding: 18 }}>
        <div style={{ color: "#fff", fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          Bikonomi
        </div>
        <div style={{ color: "rgba(255,255,255,.75)", marginBottom: 18 }}>
          Ürün linkini yapıştır, analiz ve skor anında gelsin.
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.trendyol.com/..."
            style={{
              flex: 1,
              minWidth: 260,
              padding: "14px 14px",
              borderRadius: 14,
              border: "1px solid rgba(255,255,255,.15)",
              outline: "none",
            }}
          />
          <button
            onClick={onAnalyze}
            style={{
              padding: "14px 16px",
              borderRadius: 14,
              border: 0,
              background: "#16a34a",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Analiz Et
          </button>
        </div>

        {err && <div style={{ marginTop: 10, color: "#ff6b6b" }}>{err}</div>}

        {previewTitle && !err && (
          <div style={{ marginTop: 12, color: "rgba(255,255,255,.8)", fontSize: 13 }}>
            Önizleme: <b style={{ color: "#fff" }}>{previewTitle}</b>
          </div>
        )}

        <div style={{ marginTop: 18, color: "rgba(255,255,255,.6)", fontSize: 12 }}>
          Örnek: Trendyol / Hepsiburada / Amazon ürün linki yapıştır.
        </div>
      </div>
    </main>
  );
}
