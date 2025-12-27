// src/app/check/ui.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type Offer = {
  store: string;
  price: number;
  shipping: number;
  inStock: boolean;
  url: string;
};

type Point = { d: string; p: number };

function fmtTL(n: number) {
  const s = Math.round(n).toString();
  const withDots = s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${withDots} TL`;
}

function tryParseHost(u: string) {
  try {
    const url = new URL(u);
    return url.hostname.replace("www.", "");
  } catch {
    return "";
  }
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function scoreTone(score: number) {
  if (score >= 80)
    return {
      label: "Çok iyi",
      ring: "ring-emerald-400/60",
      bg: "bg-emerald-500/10",
      text: "text-emerald-300",
      hint: "Piyasa ortalamasına göre avantajlı",
    };
  if (score >= 60)
    return {
      label: "İyi",
      ring: "ring-lime-400/60",
      bg: "bg-lime-500/10",
      text: "text-lime-300",
      hint: "Genelde iyi, küçük sapmalar var",
    };
  if (score >= 40)
    return {
      label: "Orta",
      ring: "ring-amber-400/60",
      bg: "bg-amber-500/10",
      text: "text-amber-300",
      hint: "Daha iyi fırsat çıkabilir",
    };
  return {
    label: "Riskli",
    ring: "ring-rose-400/60",
    bg: "bg-rose-500/10",
    text: "text-rose-300",
    hint: "Fiyat/Trend açısından riskli",
  };
}

function trendLabel(deltaPct: number) {
  if (deltaPct <= -8)
    return { t: "Piyasanın çok altında", cls: "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/40" };
  if (deltaPct <= -3)
    return { t: "Piyasanın altında", cls: "bg-lime-500/15 text-lime-200 ring-1 ring-lime-400/40" };
  if (deltaPct < 3)
    return { t: "Piyasa bandında", cls: "bg-slate-500/15 text-slate-200 ring-1 ring-slate-400/30" };
  if (deltaPct < 8)
    return { t: "Piyasanın üstünde", cls: "bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/40" };
  return { t: "Piyasanın çok üstünde", cls: "bg-rose-500/15 text-rose-200 ring-1 ring-rose-400/40" };
}

function simpleSparklinePath(points: Point[], w = 720, h = 180, pad = 18) {
  if (!points.length) return "";
  const prices = points.map((x) => x.p);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  const span = Math.max(1, maxP - minP);

  const innerW = w - pad * 2;
  const innerH = h - pad * 2;

  const xy = points.map((pt, i) => {
    const x = pad + (i * innerW) / Math.max(1, points.length - 1);
    const y = pad + (1 - (pt.p - minP) / span) * innerH;
    return { x, y };
  });

  let d = `M ${xy[0].x.toFixed(2)} ${xy[0].y.toFixed(2)}`;
  for (let i = 1; i < xy.length; i++) d += ` L ${xy[i].x.toFixed(2)} ${xy[i].y.toFixed(2)}`;
  return d;
}

function first<T>(arr: T[]) {
  return arr[0];
}
function last<T>(arr: T[]) {
  return arr[arr.length - 1];
}

function detectSource(u: string) {
  const s = (u || "").toLowerCase();
  if (s.includes("trendyol.com")) return "trendyol";
  if (
    s.includes("hepsiburada.com") ||
    s.includes("www.hepsiburada.com") ||
    s.includes("m.hepsiburada.com") ||
    s.includes("hepsiburada.com.tr")
  ) {
    return "hepsiburada";
  }
  if (s.includes("amazon.")) return "amazon";
  return "unknown";
}

function extractTrendyolId(u: string) {
  try {
    const url = new URL(u);
    const m = url.pathname.match(/-p-(\d+)/i);
    return m?.[1] || null;
  } catch {
    return null;
  }
}

function extractHBCode(u: string) {
  try {
    const url = new URL(u);
    const m = url.pathname.match(/-p-(HBCV[0-9A-Z]+)/i);
    return m?.[1] || null;
  } catch {
    return null;
  }
}

// ---------------- localStorage history (MVP SAFE) ----------------
function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function makeHistoryStorageKey(inputUrl: string) {
  const source = detectSource(inputUrl);

  if (source === "trendyol") {
    const id = extractTrendyolId(inputUrl) || "unknown";
    return `bikonomi:hist:trendyol:${id}`;
  }
  if (source === "hepsiburada") {
    const code = extractHBCode(inputUrl) || "unknown";
    return `bikonomi:hist:hepsiburada:${code}`;
  }

  try {
    const u = new URL(inputUrl);
    return `bikonomi:hist:${u.hostname}:${u.pathname.slice(0, 120)}`;
  } catch {
    return "bikonomi:hist:unknown";
  }
}

function readHistory(key: string): Point[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x) => x && typeof x.d === "string" && typeof x.p === "number")
      .slice(-180);
  } catch {
    return [];
  }
}

function writeHistory(key: string, points: Point[]) {
  try {
    localStorage.setItem(key, JSON.stringify(points.slice(-180)));
  } catch {
    // ignore
  }
}

// default: daily upsert
function upsertToday(points: Point[], price: number): Point[] {
  const d = todayKey();
  const next = points.slice();
  if (next.length && next[next.length - 1].d === d) {
    next[next.length - 1] = { d, p: price };
    return next;
  }
  return [...next, { d, p: price }];
}

// debug: minute granularity point
function appendDebugPoint(points: Point[], price: number): Point[] {
  const d = new Date();
  const key =
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ` +
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return [...points, { d: key, p: price }].slice(-180);
}

function pctChange(points: Point[]) {
  if (points.length < 2) return 0;
  const p0 = first(points).p;
  const p1 = last(points).p;
  return ((p1 - p0) / Math.max(1, p0)) * 100;
}
// ----------------------------------------------------------------

function makeMockProduct(inputUrl: string) {
  const host = tryParseHost(inputUrl);
  const baseTitle = "LineDeck — 4 Katlı Modüler Raf (50x128 cm)";
  const title = host ? `${baseTitle} · ${host}` : baseTitle;

  const mockPoints: Point[] = [
    { d: "G-30", p: 1299 },
    { d: "G-26", p: 1290 },
    { d: "G-22", p: 1279 },
    { d: "G-18", p: 1269 },
    { d: "G-14", p: 1249 },
    { d: "G-10", p: 1249 },
    { d: "G-6", p: 1259 },
    { d: "G-3", p: 1249 },
    { d: "Bugün", p: 1249 },
  ];

  const offers: Offer[] = [
    {
      store: "Trendyol",
      price: 1249,
      shipping: 0,
      inStock: true,
      url: inputUrl.includes("trendyol.com") ? inputUrl : "https://www.trendyol.com",
    },
    {
      store: "Hepsiburada",
      price: 1299,
      shipping: 39,
      inStock: true,
      url: inputUrl.includes("hepsiburada.com") ? inputUrl : "https://www.hepsiburada.com",
    },
    {
      store: "Amazon",
      price: 1349,
      shipping: 0,
      inStock: false,
      url: "https://www.amazon.com.tr",
    },
  ];

  let score = 65;
  score = clamp(Math.round(score), 0, 100);

  return {
    title,
    image: "https://dummyimage.com/640x640/111827/ffffff&text=Bikonomi",
    brand: "LineDeck",
    category: "Ev & Yaşam / Raf",
    points: mockPoints,
    offers,
    score,
    updatedAt: new Date().toISOString(),
  };
}

export default function CheckClient() {
  const sp = useSearchParams();
  const debug = sp.get("debug") === "1"; // ✅ debug=1 ile butonlar görünür

  const uRaw = sp.get("u") || "";
  const u = useMemo(() => uRaw.trim(), [uRaw]);

  const [manualUrl, setManualUrl] = useState<string>(u);
  const inputUrl = u || manualUrl;

  const source = useMemo(() => detectSource(inputUrl || ""), [inputUrl]);
  const base = useMemo(() => makeMockProduct(inputUrl || "https://example.com"), [inputUrl]);

  // live prices
  const [tyPrice, setTyPrice] = useState<number | null>(null);
  const [tyLoading, setTyLoading] = useState(false);

  const [hbPrice, setHbPrice] = useState<number | null>(null);
  const [hbLoading, setHbLoading] = useState(false);

  // history
  const storageKey = useMemo(() => makeHistoryStorageKey(inputUrl || ""), [inputUrl]);
  const [historyPoints, setHistoryPoints] = useState<Point[]>([]);

  useEffect(() => {
    if (!inputUrl) return;
    const pts = readHistory(storageKey);
    setHistoryPoints(pts);
  }, [storageKey, inputUrl]);

  // fetch live price
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!inputUrl) return;

      if (source !== "trendyol") {
        setTyPrice(null);
        setTyLoading(false);
      }
      if (source !== "hepsiburada") {
        setHbPrice(null);
        setHbLoading(false);
      }

      if (source === "trendyol") {
        try {
          setTyLoading(true);
          const r = await fetch(`/api/trendyol?u=${encodeURIComponent(inputUrl)}`, { cache: "no-store" });
          const j = await r.json();
          if (cancelled) return;
          if (r.ok && typeof j?.price === "number") setTyPrice(j.price);
          else setTyPrice(null);
        } catch {
          if (!cancelled) setTyPrice(null);
        } finally {
          if (!cancelled) setTyLoading(false);
        }
      }

      if (source === "hepsiburada") {
        try {
          setHbLoading(true);
          const r = await fetch(`/api/hepsiburada?u=${encodeURIComponent(inputUrl)}`, { cache: "no-store" });
          const j = await r.json();
          if (cancelled) return;
          if (r.ok && typeof j?.price === "number") setHbPrice(j.price);
          else setHbPrice(null);
        } catch {
          if (!cancelled) setHbPrice(null);
        } finally {
          if (!cancelled) setHbLoading(false);
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [inputUrl, source]);

  // offers with live override
  const offers = useMemo(() => {
    return base.offers.map((o) => {
      if (o.store === "Trendyol" && typeof tyPrice === "number") return { ...o, price: tyPrice };
      if (o.store === "Hepsiburada" && typeof hbPrice === "number") return { ...o, price: hbPrice };
      return o;
    });
  }, [base.offers, tyPrice, hbPrice]);

  // when live comes, save daily history (once per day)
  useEffect(() => {
    const live =
      source === "trendyol" ? tyPrice :
      source === "hepsiburada" ? hbPrice :
      null;

    if (typeof live !== "number") return;
    if (!storageKey || storageKey === "bikonomi:hist:unknown") return;

    setHistoryPoints((prev) => {
      const next = upsertToday(prev, live);
      writeHistory(storageKey, next);
      return next;
    });
  }, [tyPrice, hbPrice, source, storageKey]);

  const chartPoints = useMemo(() => {
    if (historyPoints.length >= 2) return historyPoints.slice(-60);
    return base.points;
  }, [historyPoints, base.points]);

  const chartMode = historyPoints.length >= 2 ? "gerçek" : "mock";
  const changePct = useMemo(() => pctChange(chartPoints), [chartPoints]);
  const path = useMemo(() => simpleSparklinePath(chartPoints), [chartPoints]);

  // cheapest + market + delta
  const cheapest = useMemo(() => {
    return offers
      .filter((o) => o.inStock)
      .slice()
      .sort((a, b) => a.price + a.shipping - (b.price + b.shipping))[0];
  }, [offers]);

  const marketAvg = useMemo(() => {
    const inStocks = offers.filter((o) => o.inStock);
    const sum = inStocks.reduce((s, o) => s + o.price + o.shipping, 0);
    return sum / Math.max(1, inStocks.length);
  }, [offers]);

  const deltaPct = useMemo(() => ((cheapest.price + cheapest.shipping - marketAvg) / marketAvg) * 100, [cheapest, marketAvg]);
  const label = trendLabel(deltaPct);
  const tone = scoreTone(base.score);

  const topBadge = useMemo(() => {
    if (source === "trendyol") return tyLoading ? "Trendyol Canlı…" : "Trendyol Canlı";
    if (source === "hepsiburada") return hbLoading ? "Hepsiburada Canlı…" : "Hepsiburada Canlı";
    return "Mock Modu";
  }, [source, tyLoading, hbLoading]);

  // helper to get current live
  function currentLive(): number | null {
    if (source === "trendyol") return typeof tyPrice === "number" ? tyPrice : null;
    if (source === "hepsiburada") return typeof hbPrice === "number" ? hbPrice : null;
    return null;
  }

  return (
    <main className="min-h-screen bg-[#0b1020] text-slate-100">
      <div className="sticky top-0 z-40 border-b border-white/10 bg-[#0b1020]/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 ring-1 ring-white/10">
              <div className="h-4 w-5">
                <div className="h-[3px] w-full rounded bg-white/90" />
                <div className="mt-[5px] h-[3px] w-4/5 rounded bg-white/90" />
                <div className="mt-[5px] h-[3px] w-3/5 rounded bg-white/90" />
              </div>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Bikonomi</div>
              <div className="text-xs text-slate-300">Ürün Analizi</div>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200 ring-1 ring-white/10">
            {topBadge}
            <span className={`h-1.5 w-1.5 rounded-full ${source === "unknown" ? "bg-slate-400" : "bg-emerald-400"}`} />
          </span>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 py-5 sm:py-8">
        {/* URL input */}
        <div className="mb-5 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10 sm:mb-7 sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="text-sm text-slate-200 sm:min-w-32">Ürün linki</div>
            <div className="flex-1">
              <input
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="Linki yapıştır (Trendyol / Hepsiburada)"
                className="w-full rounded-xl bg-[#0b1020]/60 px-4 py-3 text-sm text-slate-100 ring-1 ring-white/10 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-white/20"
              />
              <div className="mt-2 text-xs text-slate-400">
                Grafik localStorage ile birikir: normalde her gün 1 nokta. (DB yok, risk yok)
              </div>

              {/* ✅ DEBUG BUTONLARI URL KUTUSUNUN ALTINDA */}
             {debug && (
{debug && (
  <div
    className="fixed bottom-4 right-4 z-[99999] pointer-events-auto"
    style={{ zIndex: 99999 }}
  >
    <div className="rounded-2xl bg-[#0b1020]/95 p-3 ring-1 ring-white/15 backdrop-blur">
      <div className="mb-2 text-xs text-slate-200">
        Debug Panel
        <span className="ml-2 text-slate-400">(tıklanabilir)</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black ring-1 ring-white/20"
          onClick={() => {
            const live =
              source === "trendyol" ? (typeof tyPrice === "number" ? tyPrice : null) :
              source === "hepsiburada" ? (typeof hbPrice === "number" ? hbPrice : null) :
              null;

            if (typeof live !== "number") return;

            setHistoryPoints((prev) => {
              const d = new Date();
              const key =
                `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ` +
                `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;

              const next = [...prev, { d: key, p: live }].slice(-180);
              writeHistory(storageKey, next);
              return next;
            });
          }}
        >
          + Nokta ekle
        </button>

        <button
          className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200 ring-1 ring-white/10"
          onClick={() => {
            writeHistory(storageKey, []);
            setHistoryPoints([]);
          }}
        >
          Sıfırla
        </button>
      </div>

      <div className="mt-2 max-w-[360px] text-[10px] text-slate-400 break-all">
        {storageKey}
      </div>
    </div>
  </div>
)}
;
                    }}
                    title="Dakika bazlı test noktası ekler"
                  >
                    + Nokta ekle (Test)
                  </button>

                  <button
                    className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-slate-200 ring-1 ring-white/10"
                    onClick={() => {
                      writeHistory(storageKey, []);
                      setHistoryPoints([]);
                    }}
                    title="Bu ürüne ait local geçmişi siler"
                  >
                    Geçmişi sıfırla (Test)
                  </button>

                 <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-200 ring-1 ring-white/10">
  <span className="text-slate-300">Key:</span>
  <input
    value={storageKey}
    readOnly
    className="w-[360px] max-w-full bg-transparent text-slate-400 outline-none"
    onFocus={(e) => e.currentTarget.select()}
  />
</div>

                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.2fr_.8fr] lg:gap-6">
          {/* Left */}
          <section className="space-y-5">
            <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10 sm:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="relative w-full overflow-hidden rounded-2xl bg-black/20 ring-1 ring-white/10 sm:h-36 sm:w-36">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={base.image} alt={base.title} className="h-44 w-full object-cover sm:h-36" loading="lazy" />
                  <div className="absolute left-2 top-2 rounded-full bg-black/40 px-2 py-1 text-[11px] text-slate-100 ring-1 ring-white/10">
                    {base.category}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h1 className="text-base font-semibold leading-snug sm:text-lg">{base.title}</h1>
                      <div className="mt-1 text-sm text-slate-300">
                        Marka: <span className="text-slate-200">{base.brand}</span>
                      </div>
                    </div>

                    <div className={`shrink-0 rounded-2xl ${tone.bg} px-4 py-3 ring-1 ${tone.ring}`}>
                      <div className="flex items-center gap-3">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                          <div className="text-[26px] leading-none font-extrabold">{base.score}</div>
                        </div>
                        <div className="min-w-44">
                          <div className={`text-sm font-semibold ${tone.text}`}>{tone.label}</div>
                          <div className="text-xs text-slate-300">Bikonomi Skoru</div>
                          <div className="mt-1 text-[11px] text-slate-200/80">{tone.hint}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs ${label.cls}`}>{label.t}</span>
                    <span className="text-xs text-slate-400">
                      Piyasa ort.: <span className="text-slate-200">{fmtTL(marketAvg)}</span>
                    </span>
                    <span className="text-xs text-slate-400">
                      Fark:{" "}
                      <span className="text-slate-200">
                        {deltaPct >= 0 ? "+" : ""}
                        {deltaPct.toFixed(1)}%
                      </span>
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-black/20 p-3 ring-1 ring-white/10">
                      <div className="text-xs text-slate-400">En ucuz mağaza</div>
                      <div className="mt-1 text-sm font-semibold">{cheapest.store}</div>
                    </div>
                    <div className="rounded-2xl bg-black/20 p-3 ring-1 ring-white/10">
                      <div className="text-xs text-slate-400">Toplam fiyat</div>
                      <div className="mt-1 text-sm font-semibold">{fmtTL(cheapest.price + cheapest.shipping)}</div>
                      <div className="mt-1 text-[11px] text-slate-400">
                        {cheapest.shipping === 0 ? "Kargo dahil" : `Kargo: ${fmtTL(cheapest.shipping)}`}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-black/20 p-3 ring-1 ring-white/10">
                      <div className="text-xs text-slate-400">Stok</div>
                      <div className="mt-1 text-sm font-semibold">{cheapest.inStock ? "Stokta" : "Stok yok"}</div>
                      <div className="mt-1 text-[11px] text-slate-400">
                        Güncellendi: {new Date(base.updatedAt).toLocaleString("tr-TR")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10 sm:p-5">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">Fiyat Geçmişi</div>
                  <div className="mt-1 text-xs text-slate-400">
                    Mod: {chartMode} · Nokta: <span className="text-slate-200">{chartPoints.length}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-300">
                  Değişim:{" "}
                  <span className="text-slate-100">
                    {changePct >= 0 ? "+" : ""}
                    {changePct.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl bg-[#0b1020]/60 ring-1 ring-white/10">
                <svg viewBox="0 0 720 180" className="h-44 w-full">
                  <g opacity="0.25">
                    {[30, 60, 90, 120, 150].map((y) => (
                      <line key={y} x1="0" x2="720" y1={y} y2={y} stroke="white" strokeWidth="1" />
                    ))}
                  </g>
                  <path d={path} fill="none" stroke="white" strokeWidth="3" opacity="0.85" />
                </svg>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {chartPoints.slice(-10).map((pt, idx) => (
                  <span
                    key={`${pt.d}-${idx}`}
                    className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-slate-200 ring-1 ring-white/10"
                  >
                    <span className="text-slate-400">{pt.d}</span>
                    <span className="font-semibold">{fmtTL(pt.p)}</span>
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Right */}
          <aside className="space-y-5">
            <div className="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 p-5 ring-1 ring-white/10">
              <div className="text-xs text-slate-300">Sponsor Alanı</div>
              <div className="mt-2 text-lg font-semibold leading-snug">Buraya reklam / kampanya alanı</div>
              <div className="mt-2 text-sm text-slate-300">(MVP’de boş duracak, ama yerini şimdiden kilitliyoruz.)</div>
              <div className="mt-4 inline-flex items-center rounded-full bg-black/20 px-3 py-1 text-xs text-slate-200 ring-1 ring-white/10">
                728×90 / 300×250 uyumlu
              </div>
            </div>

            <div className="rounded-3xl bg-white/5 p-4 ring-1 ring-white/10 sm:p-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">Mağaza Karşılaştırması</div>
                  <div className="mt-1 text-xs text-slate-400">Toplam fiyata göre</div>
                </div>
                <div className="text-xs text-slate-300">
                  Sıralama: <span className="text-slate-100">En ucuz →</span>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {offers
                  .slice()
                  .sort((a, b) => a.price + a.shipping - (b.price + b.shipping))
                  .map((o) => {
                    const total = o.price + o.shipping;
                    const isBest = o.store === cheapest.store && o.inStock;
                    const canGo = isBest && !!o.url;

                    return (
                      <div
                        key={o.store}
                        className={`rounded-2xl p-4 ring-1 ${
                          isBest ? "bg-emerald-500/10 ring-emerald-400/40" : "bg-black/20 ring-white/10"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="text-sm font-semibold">{o.store}</div>
                              {isBest && (
                                <>
                                  <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-200 ring-1 ring-emerald-400/30">
                                    En ucuz
                                  </span>
                                  <span className="rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-semibold text-black shadow-sm">
                                    Önerilen
                                  </span>
                                </>
                              )}
                              {!o.inStock && (
                                <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-[11px] text-rose-200 ring-1 ring-rose-400/30">
                                  Stok yok
                                </span>
                              )}
                            </div>

                            <div className="mt-1 text-xs text-slate-400">
                              Fiyat: <span className="text-slate-200">{fmtTL(o.price)}</span> · Kargo:{" "}
                              <span className="text-slate-200">{o.shipping === 0 ? "Dahil" : fmtTL(o.shipping)}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs text-slate-400">Toplam</div>
                            <div className="text-base font-semibold">{fmtTL(total)}</div>
                          </div>
                        </div>

                        {canGo ? (
                          <>
                            <a
                              href={o.url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-3 block w-full rounded-xl bg-white px-4 py-2.5 text-center text-sm font-semibold text-black ring-1 ring-white/20 transition hover:bg-white/90"
                            >
                              Mağazaya git
                            </a>

                            <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-300">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                              Bikonomi bu mağazayı, toplam fiyata göre daha avantajlı buldu.
                            </div>
                          </>
                        ) : (
                          <button
                            disabled
                            className="mt-3 w-full cursor-not-allowed rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold text-slate-400 ring-1 ring-white/10"
                            title="Şimdilik sadece en ucuz mağaza aktif"
                          >
                            Mağazaya git
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>

              <div className="mt-4 text-[11px] text-slate-400">
                Şimdilik yalnızca <span className="text-slate-200">en ucuz</span> mağaza aktif. (MVP kontrolü)
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-10 pb-10 text-center text-xs text-slate-500">© {new Date().getFullYear()} Bikonomi · MVP</div>
      </div>
    </main>
  );
}
