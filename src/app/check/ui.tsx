"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type Verdict = "Alınır" | "Düşünülebilir" | "Uzak Dur";
type OfferVerdict = "Mantıklı" | "Olur" | "Mantıksız";

type AnalyzeResponse = {
  ok: boolean;
  mode: "auto" | "partial" | "manual_required";
  product: {
    productKey: string;
    source: string;
    title: string;
    image: string;
  };
  market: { avgPrice: number | null; confidence: number; sampleCount: number };
  score: {
    final: number;
    verdict: Verdict;
    summary: string;
    breakdown: { price: number; shipping: number; trust: number; market: number };
  };
  offers: Array<{
    store: string;
    price: number;
    shipping: number;
    total: number;
    inStock: boolean;
    verdict: OfferVerdict;
    url: string;
  }>;
  actions: {
    allowManual: boolean;
    searchLinks: Array<{ store: string; url: string }>;
  };
  message?: string;
};

function cx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

function fmtTRY(n: number) {
  try {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${Math.round(n)} ₺`;
  }
}

function badgeByOfferVerdict(v: OfferVerdict) {
  if (v === "Mantıklı") return "bg-emerald-600/10 text-emerald-700 border-emerald-700/20";
  if (v === "Olur") return "bg-amber-600/10 text-amber-700 border-amber-700/20";
  return "bg-rose-600/10 text-rose-700 border-rose-700/20";
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-rose-600";
}

function scoreRing(score: number) {
  if (score >= 80) return "border-emerald-700/20 bg-emerald-600/10";
  if (score >= 60) return "border-amber-700/20 bg-amber-600/10";
  return "border-rose-700/20 bg-rose-600/10";
}

async function fetchAnalyze(u: string, signal?: AbortSignal): Promise<AnalyzeResponse> {
  const res = await fetch(`/api/analyze?u=${encodeURIComponent(u)}`, { cache: "no-store", signal });
  if (!res.ok) throw new Error(`analyze_http_${res.status}`);
  return (await res.json()) as AnalyzeResponse;
}

export default function CheckClient() {
  const sp = useSearchParams();
  const uRaw = sp.get("u") || "";
  const u = useMemo(() => uRaw.trim(), [uRaw]);

  const [data, setData] = useState<AnalyzeResponse | null>(null);
  const [err, setErr] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [showBreakdown, setShowBreakdown] = useState(false);

  // tiny toast
  const [toastMsg, setToastMsg] = useState<string>("");
  function toast(msg: string) {
    setToastMsg(msg);
    window.setTimeout(() => setToastMsg(""), 1600);
  }

  // abort controller ref (re-fetch için)
  const ctrlRef = useRef<AbortController | null>(null);

  async function load() {
    if (!u) {
      setErr("Link bulunamadı. Ana sayfaya dönüp ürün linkini yapıştır.");
      setLoading(false);
      return;
    }

    ctrlRef.current?.abort();
    const ctrl = new AbortController();
    ctrlRef.current = ctrl;

    try {
      setErr("");
      setLoading(true);
      const r = await fetchAnalyze(u, ctrl.signal);
      setData(r);
    } catch {
      setErr("Analiz alınamadı. Biraz sonra tekrar dene.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    return () => ctrlRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [u]);

  // ✅ SSR-safe: window kullanmıyoruz (relative URL yeterli)
  const sharePath = useMemo(() => {
    if (!u) return "";
    return `/check?u=${encodeURIComponent(u)}`;
  }, [u]);

  async function onShare() {
    if (!data || !sharePath) return;
    const text = `Bikonomi: Almadan önce bak. Skor: ${data.score.final}/100 — ${data.score.verdict}`;

    // ✅ window sadece event içinde, client garantisiyle
    const absoluteUrl =
      typeof window !== "undefined" ? `${window.location.origin}${sharePath}` : sharePath;

    try {
      // @ts-ignore
      if (navigator.share) {
        // @ts-ignore
        await navigator.share({ title: "Bikonomi", text, url: absoluteUrl });
        return;
      }
    } catch {
      // ignore
    }

    try {
      await navigator.clipboard.writeText(absoluteUrl);
      toast("Link kopyalandı");
    } catch {
      toast("Kopyalanamadı");
    }
  }

  const content = (() => {
    if (loading) {
      return (
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="text-sm text-neutral-500">Fiyatlar ve piyasa kontrol ediliyor…</div>
        </div>
      );
    }

    if (err) {
      return (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <div className="text-sm text-rose-700">{err}</div>
        </div>
      );
    }

    if (!data) return null;

    const allowManual = data.actions?.allowManual ?? false;
    const modeMsg =
      data.mode === "manual_required"
        ? data.message || "Bu linkten otomatik veri alınamadı."
        : data.mode === "partial"
          ? "Kısmi veri bulundu. Gerekirse manuel fiyat ekleyebilirsin."
          : "";

    return (
      <>
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 -mx-4 mb-4 border-b border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <img
              src={data.product.image}
              alt={data.product.title}
              className="h-10 w-10 flex-none rounded-xl border border-neutral-200 object-cover"
              loading="lazy"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-neutral-900">{data.product.title}</div>
              <div className="text-xs text-neutral-500">Kaynak: {data.product.source}</div>
            </div>

            <button
              onClick={onShare}
              className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-900 hover:bg-neutral-50"
              title="Paylaş"
            >
              Paylaş
            </button>
          </div>
        </div>

        {modeMsg ? (
          <div className="mb-4 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
            {modeMsg}
          </div>
        ) : null}

        {/* Score */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-neutral-900">Bikonomi Skoru</div>
              <div className="mt-1 text-sm text-neutral-600">{data.score.summary}</div>

              <button
                onClick={() => setShowBreakdown((s) => !s)}
                className="mt-3 text-xs font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-900"
              >
                {showBreakdown ? "Detayları gizle" : "Skor nasıl hesaplandı?"}
              </button>
            </div>

            <div className={cx("flex h-16 w-16 flex-none items-center justify-center rounded-2xl border", scoreRing(data.score.final))}>
              <div className={cx("text-2xl font-extrabold", scoreColor(data.score.final))}>{data.score.final}</div>
            </div>
          </div>

          {showBreakdown ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <BreakRow label="Fiyat avantajı" value={data.score.breakdown.price} max={40} />
              <BreakRow label="Kargo" value={data.score.breakdown.shipping} max={20} />
              <BreakRow label="Stok & güven" value={data.score.breakdown.trust} max={20} />
              <BreakRow label="Piyasa farkı" value={data.score.breakdown.market} max={20} />
            </div>
          ) : null}

          <div className="mt-4 text-xs text-neutral-500">
            Piyasa:{" "}
            {data.market.avgPrice ? (
              <>
                ~{fmtTRY(data.market.avgPrice)} (güven: {Math.round(data.market.confidence * 100)}%, örnek: {data.market.sampleCount})
              </>
            ) : (
              <>Yeterli veri yok</>
            )}
          </div>
        </div>

        {/* Offers table */}
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-3 text-sm font-semibold text-neutral-900">Karşılaştırma</div>

          {data.offers?.length ? (
            <OfferTable offers={data.offers} />
          ) : (
            <div className="text-sm text-neutral-600">Şu an otomatik teklif bulunamadı.</div>
          )}
        </div>

        {/* Other stores search */}
        <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
          <div className="mb-3 text-sm font-semibold text-neutral-900">Diğer mağazalarda ara</div>
          <SearchLinks links={data.actions.searchLinks} />
          <div className="mt-3 text-xs text-neutral-500">Eşleme yokken bile tek tıkla arayabilirsin.</div>
        </div>

        {/* Manual contribution */}
        {allowManual ? (
          <div className="mt-4 rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="mb-2 text-sm font-semibold text-neutral-900">Fiyat gördüysen ekle</div>
            <div className="mb-3 text-xs text-neutral-500">1 fiyat gir, 100 kişiye yardım et.</div>

            <ManualBox
              productKey={data.product.productKey}
              defaultStore={data.product.source}
              onDone={async () => {
                toast("Kaydedildi, güncelliyorum…");
                await load();
                toast("Güncellendi");
              }}
            />
          </div>
        ) : null}

        {/* Trust footer */}
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-5 text-xs text-neutral-600">
          <div>Bikonomi farklı kaynaklardan veri toplar.</div>
          <div>Reklam değil, analiz.</div>
          <div>Son karar kullanıcıya aittir.</div>
        </div>
      </>
    );
  })();

  return (
    <div className="mx-auto max-w-2xl px-4 pb-10 pt-4">
      {content}

      {toastMsg ? (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-neutral-900 px-4 py-2 text-xs font-medium text-white shadow">
          {toastMsg}
        </div>
      ) : null}
    </div>
  );
}

function BreakRow(props: { label: string; value: number; max: number }) {
  const pct = Math.round((props.value / props.max) * 100);
  return (
    <div className="rounded-xl border border-neutral-200 p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-neutral-900">{props.label}</span>
        <span className="text-neutral-600">
          {props.value}/{props.max}
        </span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-neutral-100">
        <div className="h-2 rounded-full bg-neutral-900" style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
      </div>
    </div>
  );
}

function OfferTable({ offers }: { offers: AnalyzeResponse["offers"] }) {
  const sorted = [...offers].sort((a, b) => {
    const rank = (v: OfferVerdict) => (v === "Mantıklı" ? 0 : v === "Olur" ? 1 : 2);
    const r = rank(a.verdict) - rank(b.verdict);
    if (r !== 0) return r;
    return (a.total || 0) - (b.total || 0);
  });

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200">
      <div className="grid grid-cols-12 bg-neutral-50 px-3 py-2 text-[11px] font-semibold text-neutral-600">
        <div className="col-span-4">Mağaza</div>
        <div className="col-span-3 text-right">Fiyat</div>
        <div className="col-span-3 text-right">Kargo</div>
        <div className="col-span-2 text-right">Toplam</div>
      </div>

      {sorted.map((o, i) => (
        <a
          key={`${o.store}-${i}`}
          href={o.url}
          target="_blank"
          rel="noopener noreferrer"
          className="grid grid-cols-12 items-center gap-0 border-t border-neutral-200 px-3 py-3 hover:bg-neutral-50"
        >
          <div className="col-span-4 min-w-0">
            <div className="flex items-center gap-2">
              <span className={cx("inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-semibold", badgeByOfferVerdict(o.verdict))}>
                {o.verdict}
              </span>
              <span className="truncate text-sm font-medium text-neutral-900">{o.store}</span>
            </div>
          </div>

          <div className="col-span-3 text-right text-sm text-neutral-900">{fmtTRY(o.price || 0)}</div>
          <div className="col-span-3 text-right text-sm text-neutral-900">{fmtTRY(o.shipping || 0)}</div>
          <div className="col-span-2 text-right text-sm font-semibold text-neutral-900">{fmtTRY(o.total || 0)}</div>
        </a>
      ))}
    </div>
  );
}

function SearchLinks({ links }: { links: Array<{ store: string; url: string }> }) {
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.store}
          href={l.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-900 hover:bg-neutral-50"
        >
          {l.store}’da Ara
        </a>
      ))}
    </div>
  );
}

function ManualBox(props: { productKey: string; defaultStore: string; onDone: () => void | Promise<void> }) {
  const [store, setStore] = useState(props.defaultStore);
  const [price, setPrice] = useState<string>("");
  const [shipping, setShipping] = useState<string>("0");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function submit() {
    const p = Number(price);
    const s = Number(shipping || 0);
    if (!Number.isFinite(p) || p <= 0) {
      setMsg("Fiyat gir.");
      return;
    }

    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/contribute", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productKey: props.productKey,
          store,
          price: Math.round(p),
          shipping: Math.max(0, Math.round(s)),
        }),
      });

      if (!res.ok) throw new Error("contrib_failed");

      setPrice("");
      setShipping("0");
      setMsg("Teşekkürler!");
      await props.onDone();
    } catch {
      setMsg("Kaydedilemedi. Tekrar dene.");
    } finally {
      setBusy(false);
      window.setTimeout(() => setMsg(""), 1400);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <select
          value={store}
          onChange={(e) => setStore(e.target.value)}
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
        >
          <option value="Trendyol">Trendyol</option>
          <option value="Hepsiburada">Hepsiburada</option>
          <option value="Amazon">Amazon</option>
          <option value="Diğer">Diğer</option>
        </select>

        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          inputMode="numeric"
          placeholder="Fiyat (₺)"
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
        />

        <input
          value={shipping}
          onChange={(e) => setShipping(e.target.value)}
          inputMode="numeric"
          placeholder="Kargo (₺)"
          className="rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={submit}
          disabled={busy}
          className={cx(
            "rounded-xl px-4 py-2 text-sm font-semibold text-white",
            busy ? "bg-neutral-400" : "bg-neutral-900 hover:bg-neutral-800"
          )}
        >
          {busy ? "Gönderiliyor…" : "Gönder"}
        </button>
        {msg ? <div className="text-xs text-neutral-600">{msg}</div> : null}
      </div>
    </div>
  );
}
