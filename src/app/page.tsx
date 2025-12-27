"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import LogoLock from "@/components/LogoLock";

export default function HomePage() {
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [price, setPrice] = useState(""); // manuel fiyat (opsiyonel)

  const trimmed = useMemo(() => url.trim(), [url]);

  const isValidLike = useMemo(() => {
    return trimmed.length > 0;
  }, [trimmed]);

  function goAnalyze() {
    if (!isValidLike) return;

    router.push(
      `/check?u=${encodeURIComponent(trimmed)}&p=${encodeURIComponent(price.trim())}`
    );
  }

  return (
    <main className="min-h-screen bg-[#0b0f14] text-white">
      <div className="mx-auto max-w-xl px-5 py-10">
        <div className="mb-10">
          <LogoLock />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight">
            Ürün linkini yapıştır,{" "}
            <span className="text-white/70">akıllı karar ver.</span>
          </h1>

          <p className="mt-2 text-sm text-white/60">
            Linki kopyala → yapıştır → (gerekirse fiyatı yaz) → Bikonomi Skoru’nu gör.
          </p>

          {/* Link */}
          <div className="mt-5">
            <label className="text-xs text-white/50">Ürün linki</label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Örn: https://www.trendyol.com/..."
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-white/20"
              onKeyDown={(e) => {
                if (e.key === "Enter") goAnalyze();
              }}
            />
          </div>

          {/* Manuel fiyat (opsiyonel) */}
          <div className="mt-4">
            <label className="text-xs text-white/50">Gördüğün fiyat (opsiyonel)</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Örn: 32.999,00"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none placeholder:text-white/25 focus:border-white/20"
              onKeyDown={(e) => {
                if (e.key === "Enter") goAnalyze();
              }}
            />
            <div className="mt-1 text-[11px] text-white/40">
              Not: Trendyol erişimi kilitlenirse bu fiyatla analiz devam eder.
            </div>
          </div>

          <button
            onClick={goAnalyze}
            disabled={!isValidLike}
            className="mt-4 w-full rounded-2xl bg-white py-3 text-sm font-semibold text-black disabled:opacity-40"
          >
            Analiz Et
          </button>

          {/* Vitrin / Reklam alanı */}
          <div className="mt-6 rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/0 p-4">
            <div className="text-xs text-white/50">Vitrin Alanı</div>
            <div className="mt-1 text-sm font-medium">
              Buraya yakında sponsor analizler &amp; kampanyalar gelecek.
            </div>
            <div className="mt-1 text-xs text-white/60">
              Gelir kapısı: ✅ (şimdilik “demo banner”)
            </div>
          </div>

          {/* Güven satırı */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatBox title="Kaynak" value="Trendyol" />
            <StatBox title="Analiz süresi" value="~2 sn" />
            <StatBox title="Skor" value="0–100" />
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-white/35">
          © {new Date().getFullYear()} Bikonomi — Demo UI
        </div>
      </div>
    </main>
  );
}

function StatBox({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="text-[11px] text-white/45">{title}</div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
