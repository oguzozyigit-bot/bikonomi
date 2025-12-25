"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;

    router.push(`/p/demo?url=${encodeURIComponent(trimmed)}`);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto inline-flex items-center gap-2">
          <div className="h-10 w-10 rounded-2xl border bg-white" />
          <div className="text-2xl font-semibold tracking-tight">
            bikonomi
            <span className="text-green-600">.</span>
          </div>
        </div>

        <p className="mt-3 text-sm opacity-70">
          Link yapıştır — fiyat/puan/özet tek ekranda.
        </p>
      </div>

      {/* Search */}
      <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-2xl">
        <div className="flex items-stretch gap-2 rounded-2xl border bg-white p-2 shadow-sm">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Trendyol / Hepsiburada ürün linki yapıştır…"
            className="w-full rounded-xl px-4 py-3 text-base outline-none"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
          />

          <button
            type="submit"
            className="rounded-xl bg-green-600 px-5 py-3 text-base font-medium text-white hover:bg-green-700 active:scale-[0.99]"
          >
            Ara
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs opacity-70">
          <span className="rounded-full border bg-white px-3 py-1">✅ build geçti</span>
          <span className="rounded-full border bg-white px-3 py-1">⚡ /api/fetch çalışıyor</span>
          <span className="rounded-full border bg-white px-3 py-1">🧪 /p/demo?url=…</span>
        </div>
      </form>

      {/* Footer note */}
      <div className="mt-10 text-center text-xs opacity-60">
        İpucu: Linki yapıştır → <span className="font-medium">Ara</span> → otomatik ürün sayfasına geçer.
      </div>
    </main>
  );
}
