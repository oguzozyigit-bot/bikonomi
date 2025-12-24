"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function cls(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

const cards = [
  {
    decision: "ALINMAZ",
    title: "Bluetooth Kulaklık",
    note: "Fiyat düşük ama güven zayıf",
    href: "/products/demo?decision=ALINMAZ",
  },
  {
    decision: "DIKKAT",
    title: "Elektrikli Süpürge",
    note: "İyi ürün ama fiyat dalgalı",
    href: "/products/demo?decision=DIKKAT",
  },
  {
    decision: "ALINIR",
    title: "Kahve Makinesi",
    note: "Fiyat & güven dengeli",
    href: "/products/demo?decision=ALINIR",
  },
] as const;

export default function HomeClient() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const slogan = "Ucuz olan değil, doğru olan.";

  const decisionPick = useMemo(() => {
    // demo: url uzunluğuna göre bir karar seç (şimdilik)
    const n = url.trim().length;
    if (n === 0) return "DIKKAT";
    if (n % 3 === 0) return "ALINMAZ";
    if (n % 3 === 1) return "DIKKAT";
    return "ALINIR";
  }, [url]);

  async function onAnalyze() {
    setLoading(true);
    // 2.2 sn loader hissi
    await new Promise((r) => setTimeout(r, 2200));
    router.push(`/products/demo?decision=${decisionPick}`);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="text-center">
        <div className="text-3xl font-semibold text-white">{slogan}</div>
        <div className="mt-2 text-white/70">
          Fiyat, güven ve veriye göre karar verir.
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Ürün linkini yapıştır"
            className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/40"
          />
          <button
            onClick={onAnalyze}
            disabled={loading}
            className={cls(
              "rounded-xl px-5 py-3 text-sm font-semibold shadow",
              loading
                ? "bg-white/10 text-white/60"
                : "bg-white text-black hover:opacity-95"
            )}
          >
            {loading ? "Bikonomi ürünü inceliyor…" : "Analiz Et"}
          </button>
        </div>
      </div>

      <div className="mt-10">
        <div className="mb-3 text-sm text-white/70">Son Bikonomi Kararları</div>

        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((c) => (
            <a
              key={c.title}
              href={c.href}
              className="rounded-2xl border border-white/10 bg-white/5 p-5 text-white hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="text-xs text-white/60">{c.decision}</div>
                <div className="text-lg">
                  {c.decision === "ALINIR"
                    ? "✅"
                    : c.decision === "DIKKAT"
                    ? "⚠️"
                    : "⛔"}
                </div>
              </div>
              <div className="mt-2 font-semibold">{c.title}</div>
              <div className="mt-1 text-sm text-white/70">{c.note}</div>
            </a>
          ))}
        </div>
      </div>

      <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-5 text-white/80">
        <div className="font-semibold text-white">Bugün Neden Alınmaz?</div>
        <div className="mt-2 flex flex-wrap gap-2">
          {[
            "Satıcı güveni düşük",
            "Fiyat ani düştü",
            "Sahte indirim ihtimali",
            "Stok / teslimat tutarsız",
          ].map((t) => (
            <span
              key={t}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
