// app/products/[id]/page.tsx
"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";

function badgeText(score: number) {
  if (score >= 85) return "Çok Mantıklı";
  if (score >= 70) return "Mantıklı Seçim";
  if (score >= 50) return "Düşünülebilir";
  return "Mantıksız";
}

function badgeTone(score: number) {
  if (score >= 85) return "bg-emerald-100 text-emerald-800";
  if (score >= 70) return "bg-emerald-100 text-emerald-800";
  if (score >= 50) return "bg-amber-100 text-amber-800";
  return "bg-rose-100 text-rose-800";
}

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const sp = useSearchParams();

  const id = params?.id ?? "unknown";
  const scoreRaw = sp.get("score");
  const src = sp.get("src");

  const score = Number(scoreRaw ?? "0");

  // score yoksa bile sayfa patlamasın; sadece uyarı göster
  const hasScore = Number.isFinite(score) && score > 0;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 space-y-8">
      {/* ÜST BAR */}
      <div className="flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-gray-700 hover:underline">
          ← Ana sayfa
        </Link>
        <span className="text-xs text-gray-400">ID: {id}</span>
      </div>

      {/* SKOR */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">Bikonomi Skoru</h1>
            <p className="mt-1 text-sm text-gray-600">
              Linkten gelen hızlı analiz (mock).
            </p>
            {src ? (
              <p className="mt-2 text-xs text-gray-500 break-all">
                Kaynak: {src}
              </p>
            ) : null}
          </div>

          <div className="text-right">
            <div className="text-5xl font-extrabold tabular-nums">
              {hasScore ? score : "—"}
            </div>
            <span
              className={`mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeTone(
                hasScore ? score : 0
              )}`}
            >
              {hasScore ? badgeText(score) : "Skor bulunamadı"}
            </span>
          </div>
        </div>
      </section>

      {/* TEKLİFLER */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold">Teklifler</h2>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold">Trendyol</div>
              <div className="mt-1 text-xs text-gray-500">Stok var • Hızlı kargo</div>
            </div>
            <div className="text-sm font-bold">₺1.299</div>
          </div>

          <div className="flex items-center justify-between rounded-2xl border p-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold">Hepsiburada</div>
              <div className="mt-1 text-xs text-gray-500">Stok sinyali orta</div>
            </div>
            <div className="text-sm font-bold">₺1.349</div>
          </div>
        </div>
      </section>

      {/* BİKONOMİ NE DİYOR */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold">Bikonomi ne diyor?</h2>
        <p className="mt-3 text-sm text-gray-700">
          {hasScore
            ? score >= 70
              ? "Fiyat/performans tarafı güçlü görünüyor. En ucuz olanı değil, en mantıklıyı hedefliyorsan bu seviyede alınabilir."
              : "Skor düşük. Aynı bütçede daha mantıklı alternatif çıkma ihtimali yüksek; acele etme."
            : "Skor gelmedi. Link akışını kontrol et: /analyze sayfası score parametresi göndermeli."}
        </p>
      </section>

      {/* KİM ALMALI */}
      <section className="rounded-3xl border bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold">Kim almalı?</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-sm text-gray-700">
          <li>“Ucuza değil, mantıklıya” bakanlar</li>
          <li>Kararını skor + teklif dengesiyle verenler</li>
          <li>İade/garanti ve satıcı güvenini önemseyenler</li>
        </ul>
      </section>

      {/* ALT CTA */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-2xl border px-4 py-2 text-sm font-semibold text-gray-900"
        >
          Başka link dene
        </Link>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="rounded-2xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white"
        >
          Skora dön
        </button>
      </div>
    </main>
  );
}
