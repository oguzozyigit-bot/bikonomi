// app/page.tsx
"use client";

import { useMemo, useState } from "react";
import { ALLOWED_DOMAINS } from "../lib/allowedDomains";
export default function HomePage() {
  const [input, setInput] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const allowedPretty = useMemo(() => {
    // ikonu sonra koyarız; şimdilik net liste
    const unique = Array.from(new Set(ALLOWED_DOMAINS.map(d => d.replace(/^www\./, ""))));
    return unique;
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    try {
      const url = new URL(input.trim());
      const host = url.hostname.toLowerCase();
      const ok = ALLOWED_DOMAINS.includes(host as any);

      if (!ok) {
        setErr("Bu link şu an desteklenmiyor. Lütfen izinli sitelerden bir link yapıştır.");
        return;
      }

      // Analiz sayfasına gönder
      const qp = new URLSearchParams({ url: url.toString() });
      window.location.href = `/analyze?${qp.toString()}`;
    } catch {
      setErr("Link geçersiz görünüyor. Lütfen tam URL yapıştır (https:// ile).");
    }
  }

  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <header className="mx-auto max-w-5xl px-4 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-zinc-900" />
          <div className="leading-tight">
            <div className="text-lg font-semibold">Bikonomi</div>
            <div className="text-xs text-zinc-500">Linki yapıştır, analiz etsin.</div>
          </div>
        </div>
        <nav className="text-sm text-zinc-600 flex gap-4">
          <a className="hover:text-zinc-900" href="#izinli">İzinli Siteler</a>
          <a className="hover:text-zinc-900" href="#nasil">Nasıl Çalışır</a>
        </nav>
      </header>

      <section className="mx-auto max-w-5xl px-4 pt-10 pb-8">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
              Aynı ürün, farklı fiyatlar.
              <span className="block">Bikonomi bakar.</span>
            </h1>
            <p className="mt-3 text-zinc-600">
              Yalnızca <span className="font-medium text-zinc-900">izinli sitelerden</span> gelen linkleri analiz eder.
            </p>

            <form onSubmit={onSubmit} className="mt-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ürün linkini buraya yapıştır (Trendyol / Hepsiburada / n11 / Amazon TR)"
                  className="w-full rounded-2xl border border-zinc-200 px-4 py-3 outline-none focus:ring-2 focus:ring-zinc-900"
                />
                <button
                  type="submit"
                  className="rounded-2xl bg-zinc-900 px-5 py-3 text-white font-medium hover:bg-zinc-800"
                >
                  Analiz Et
                </button>
              </div>
              {err && (
                <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {err}
                </div>
              )}
              <div className="mt-3 text-xs text-zinc-500">
                İpucu: Linkin sonunda ne olursa olsun sorun değil — önemli olan alan adı.
              </div>
            </form>
          </div>

          {/* Sağ “mock” */}
          <div className="rounded-3xl border border-zinc-200 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">Bikonomi Sonuç</div>
              <div className="text-xs text-zinc-500">Demo</div>
            </div>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-zinc-50 p-4 border border-zinc-100">
                <div className="text-sm font-medium">Bluetooth Kulaklık</div>
                <div className="mt-1 text-2xl font-semibold">₺1.249</div>
                <div className="mt-1 text-xs text-zinc-500">En ucuz: A Mağazası</div>
              </div>
              <div className="rounded-2xl bg-white p-4 border border-zinc-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Bikonomi Skoru</div>
                  <div className="text-sm font-semibold">82/100</div>
                </div>
                <div className="mt-2 h-2 rounded-full bg-zinc-100 overflow-hidden">
                  <div className="h-2 w-[82%] bg-zinc-900" />
                </div>
              </div>
              <div className="rounded-2xl bg-white p-4 border border-zinc-200 text-sm text-zinc-600">
                Link yapıştırınca gerçek analiz sayfasına yönlendireceğiz.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="izinli" className="mx-auto max-w-5xl px-4 py-8">
        <h2 className="text-lg font-semibold">İzinli Siteler</h2>
        <p className="mt-1 text-sm text-zinc-600">
          Şimdilik bu alan adlarını destekliyoruz. Listeyi büyüteceğiz.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {allowedPretty.map((d) => (
            <span key={d} className="rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-700">
              {d}
            </span>
          ))}
        </div>
      </section>

      <section id="nasil" className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="text-lg font-semibold">Nasıl çalışır?</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Card title="1) Linki yapıştır" text="Ürünü nerede gördüysen buraya bırak." />
          <Card title="2) Doğrula" text="İzinli site + ürün sayfası kontrolü yapılır." />
          <Card title="3) Sonucu gör" text="Karşılaştırma, skor ve özet tek ekranda." />
        </div>
      </section>

      <footer className="mx-auto max-w-5xl px-4 py-8 text-xs text-zinc-500">
        © {new Date().getFullYear()} Bikonomi
      </footer>
    </main>
  );
}

function Card({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-zinc-200 p-5">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-2 text-sm text-zinc-600">{text}</div>
    </div>
  );
}
