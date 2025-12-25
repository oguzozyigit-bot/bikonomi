"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type ApiResp = {
  ok: boolean;
  data?: {
    source?: string;
    url?: string;
    title?: string;
    price?: number | null;
    currency?: string | null;
    rating?: number | null;
    ratingCount?: number | null;
  };
  error?: string;
};

export default function DemoClient() {
  const sp = useSearchParams();
  const rawUrl = useMemo(() => (sp.get("url") || "").trim(), [sp]);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState<ApiResp["data"] | null>(null);

  useEffect(() => {
    async function run() {
      if (!rawUrl) return;
      setLoading(true);
      setErr("");
      setData(null);

      try {
        const res = await fetch(`/api/fetch?url=${encodeURIComponent(rawUrl)}`, {
          cache: "no-store",
        });
        const json: ApiResp = await res.json();
        if (!json?.ok) throw new Error(json?.error || "API ok=false");
        setData(json.data || null);
      } catch (e: any) {
        setErr(e?.message || "Hata");
      } finally {
        setLoading(false);
      }
    }

    run();
  }, [rawUrl]);

  if (!rawUrl) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border bg-white p-5">
          <h1 className="text-xl font-semibold">Bikonomi</h1>
          <p className="mt-2 opacity-70">URL yok. Ana sayfadan link yapıştır.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="rounded-2xl border bg-white p-5">
        <div className="text-sm opacity-60">
          {(data?.source || "kaynak").toUpperCase()}
        </div>

        <h1 className="mt-2 text-xl font-semibold">
          {loading ? "Yükleniyor…" : data?.title || "Başlık alınamadı"}
        </h1>

        {err && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {err}
          </div>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border p-3">
            <div className="text-xs opacity-60">Fiyat</div>
            <div className="mt-1 text-lg font-semibold">
              {data?.price ?? "—"} {data?.currency ?? "TRY"}
            </div>
          </div>

          <div className="rounded-xl border p-3">
            <div className="text-xs opacity-60">Puan</div>
            <div className="mt-1 text-lg font-semibold">
              {data?.rating ?? "—"}{" "}
              <span className="text-sm opacity-70">
                ({data?.ratingCount ?? "—"})
              </span>
            </div>
          </div>
        </div>

        <a
          href={data?.url || rawUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700"
        >
          Ürüne Git →
        </a>
      </div>
    </main>
  );
}
