"use client";

import { useState } from "react";

export default function ProductAlertCard({ productId }: { productId: string }) {
  const [email, setEmail] = useState("");
  const [priceTarget, setPriceTarget] = useState("");
  const [scoreTarget, setScoreTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    setOk(null);
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          email,
          priceTarget: priceTarget ? Number(priceTarget) : undefined,
          scoreTarget: scoreTarget ? Number(scoreTarget) : undefined,
        }),
      });
      const data = await res.json();
      if (data?.ok) {
        setOk("Alarm kuruldu. E-posta ile bilgilendireceğiz.");
        setEmail("");
        setPriceTarget("");
        setScoreTarget("");
      } else {
        setErr(data?.error || "Alarm kurulamadı.");
      }
    } catch {
      setErr("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-base font-extrabold text-gray-900">🔔 Ürün Alarmı</div>
        <div className="text-xs text-gray-500">Şimdilik e-mail</div>
      </div>

      <p className="mt-2 text-sm text-gray-600">
        Fiyat düşerse, skor yükselirse veya daha iyi alternatif çıkarsa haber verelim.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="E-posta adresin"
          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10 md:col-span-1"
        />

        <input
          value={priceTarget}
          onChange={(e) => setPriceTarget(e.target.value)}
          placeholder="Fiyat hedefi (₺) — opsiyonel"
          inputMode="decimal"
          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
        />

        <input
          value={scoreTarget}
          onChange={(e) => setScoreTarget(e.target.value)}
          placeholder="Skor hedefi (0–100) — opsiyonel"
          inputMode="numeric"
          className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-900/10"
        />
      </div>

      <button
        onClick={submit}
        disabled={loading || !email.trim()}
        className="mt-4 w-full rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "Kuruluyor..." : "Alarmı Kur"}
      </button>

      {ok && <div className="mt-3 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">{ok}</div>}
      {err && <div className="mt-3 rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-800">{err}</div>}

      <div className="mt-3 text-xs text-gray-500">
        Not: WhatsApp bildirimi yakında.
      </div>
    </div>
  );
}
