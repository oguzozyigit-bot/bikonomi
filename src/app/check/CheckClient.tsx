"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

function buildShareUrl(uParam: string, pParam: string) {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://www.bikonomi.com";

  const url = new URL("/check", origin);

  if (uParam) url.searchParams.set("u", uParam);
  if (pParam) url.searchParams.set("p", pParam);

  // WhatsApp cache kırmak için
  url.searchParams.set("v", String(Date.now()));

  return url.toString();
}

function buildWhatsAppLink(shareUrl: string, score: number, decision: string, title: string) {
  const text =
    `Bikonomi sonucu:\n` +
    `${title}\n` +
    `Skor: ${score} — ${decision}\n` +
    `${shareUrl}`;

  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export default function CheckClient() {
  const sp = useSearchParams();

  const uRaw = sp.get("u") || "";
  const pRaw = sp.get("p") || "";

  const u = useMemo(() => uRaw.trim(), [uRaw]);
  const p = useMemo(() => pRaw.trim(), [pRaw]);

  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!u) {
      setErr("Link bulunamadı. Ana sayfaya dönüp ürün linkini yapıştır.");
      setLoading(false);
      return;
    }

    const ctrl = new AbortController();

    (async () => {
      try {
        setErr("");
        setLoading(true);

        const res = await fetch(
          `/api/analyze?u=${encodeURIComponent(u)}&p=${encodeURIComponent(p)}`,
          { signal: ctrl.signal, cache: "no-store" }
        );

        let json: any = null;
        try {
          json = await res.json();
        } catch {
          throw new Error("Sunucudan geçersiz yanıt alındı (JSON değil).");
        }

        if (!res.ok) {
          const msg = json?.detail
            ? `${json.error}: ${json.detail}`
            : json?.error || "Analyze failed";
          throw new Error(msg);
        }

        setData(json);
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setErr(e?.message || "Hata");
      } finally {
        setLoading(false);
      }
    })();

    return () => ctrl.abort();
  }, [u, p]);

  if (loading) return <div className="p-4 text-white">Analiz ediliyor…</div>;
  if (err) return <div className="p-4 text-red-300">Hata: {err}</div>;
  if (!data) return <div className="p-4 text-white">Veri yok.</div>;

  const trendPct = Math.round(((data.trend30dPct ?? 0) * 100) as number);

  // ✅ Karar (hook yok)
  const s = Number(data?.score ?? 0);
  const decision = s >= 85 ? "ALINIR" : s >= 70 ? "DİKKAT" : "ALINMAZ";

  const shareUrl = buildShareUrl(u, p);

  const onWhatsAppShare = () => {
    const title = String(data?.title ?? "Bikonomi");
    const scoreNum = Number(data?.score ?? 0);

    // Mobilde native paylaşım varsa onu dene
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      (navigator as any)
        .share({
          title: "Bikonomi",
          text: `${title}\nSkor: ${scoreNum} — ${decision}`,
          url: shareUrl,
        })
        .catch(() => {});
      return;
    }

    // Desktop fallback: WhatsApp Web
    const wa = buildWhatsAppLink(shareUrl, scoreNum, decision, title);
    window.open(wa, "_blank", "noopener,noreferrer");
  };

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Paylaşım linki kopyalandı ✅");
    } catch {
      window.prompt("Linki kopyala:", shareUrl);
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0f14] text-white p-4">
      <div className="mx-auto max-w-xl space-y-4">
        {/* Ürün */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/60">Ürün</div>
          <div className="mt-1 text-xl font-semibold">{data.title}</div>

          {data.cleanUrl ? (
            <a
              href={data.cleanUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs text-white/50 underline underline-offset-4 hover:text-white/70"
            >
              Ürün linkini aç
            </a>
          ) : null}

          {data.manualPriceUsed && (
            <div className="mt-3 inline-flex items-center rounded-full bg-yellow-500/10 px-3 py-1 text-xs text-yellow-400">
              Manuel fiyat kullanıldı
            </div>
          )}
        </div>

        {/* Skor */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm text-white/60">Bikonomi Skoru</div>
          <div className="mt-2 text-5xl font-bold">{data.score}</div>

          {/* ✅ Karar rozeti */}
          <div
            className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
              decision === "ALINIR"
                ? "bg-green-500/15 text-green-400"
                : decision === "DİKKAT"
                ? "bg-yellow-500/15 text-yellow-400"
                : "bg-red-500/15 text-red-400"
            }`}
          >
            {decision}
          </div>

          {/* ✅ Skor açıklaması */}
          <p className="mt-2 text-xs text-white/60">
            Bu skor; fiyat, piyasa karşılaştırması, trend ve güven sinyallerine göre 0–100 arası
            hesaplanır.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <ScoreLine label="💸 Fiyat" value={`${data.breakdown?.priceScore ?? 0}/45`} />
            <ScoreLine label="📊 Piyasa" value={`${data.breakdown?.marketScore ?? 0}/20`} />
            <ScoreLine label="📈 Trend" value={`${data.breakdown?.trendScore ?? 0}/15`} />
            <ScoreLine label="🛡 Güven" value={`${data.breakdown?.trustScore ?? 0}/10`} />
            <ScoreLine label="📦 Stok" value={`${data.breakdown?.availabilityScore ?? 0}/10`} />
          </div>

          {/* ✅ Paylaşım butonları */}
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onWhatsAppShare}
              className="rounded-2xl bg-[#25D366] px-4 py-3 text-sm font-semibold text-black hover:opacity-90"
            >
              WhatsApp’ta Paylaş
            </button>

            <button
              type="button"
              onClick={onCopyLink}
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm font-semibold text-white hover:bg-black/40"
            >
              Linki Kopyala
            </button>

            <a
              href={shareUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 hover:bg-white/10"
            >
              Paylaşım Linkini Aç
            </a>
          </div>

          <div className="mt-2 text-[11px] text-white/40">
            Not: Paylaşım linki otomatik <span className="font-mono">v=</span> ekleyerek WhatsApp
            önizleme cache’ini kırar.
          </div>
        </div>

        {/* Özet */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-sm">
          <div className="text-white/60">Özet</div>
          <div className="mt-2 space-y-1">
            <div>
              En ucuz toplam: <b>{data.cheapestTotal}</b>
            </div>
            <div>
              Median toplam: <b>{data.medianTotal}</b>
            </div>
            <div>
              30 gün trend: <b>%{trendPct}</b>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ScoreLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
      <div className="text-white/60 text-xs">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
