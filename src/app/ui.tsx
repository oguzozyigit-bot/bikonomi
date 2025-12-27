"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function cx(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export default function HomeClient() {
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const cleaned = useMemo(() => url.trim(), [url]);

  function normalizeLight(u: string) {
    // kullanıcı dostu hafif normalize (backend zaten asıl normalize ediyor)
    let s = u.trim();
    if (!s) return "";
    if (!/^https?:\/\//i.test(s)) s = "https://" + s;
    s = s.replace(/^http:\/\//i, "https://");
    s = s.replace(/^https:\/\/www\./i, "https://");
    return s;
  }

  function go() {
    const u = normalizeLight(cleaned);
    if (!u) {
      setErr("Link bulunamadı. Ürün linkini yapıştır.");
      return;
    }

    // URL doğrulaması (kırmadan)
    try {
      // eslint-disable-next-line no-new
      new URL(u);
    } catch {
      setErr("Link bulunamadı. Ürün linkini yapıştır.");
      return;
    }

    setErr("");
    setBusy(true);

    // hızlı his
    const target = `/check?u=${encodeURIComponent(u)}`;
    router.push(target);
  }

  return (
    <div className="min-h-[100dvh] bg-white">
      <div className="mx-auto flex max-w-2xl flex-col px-4 pb-14 pt-10">
        {/* Top */}
        <div className="mb-8">
          <div className="text-sm font-semibold text-neutral-900">Bikonomi</div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-neutral-900">
            Almadan önce bak.
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Aynı ürün, farklı fiyat. <span className="text-neutral-900">Reklam değil, analiz.</span>
          </p>
        </div>

        {/* Input */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
          <label className="mb-2 block text-xs font-semibold text-neutral-700">
            Ürün linki
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") go();
              }}
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Trendyol / Hepsiburada / Amazon ürün linkini yapıştır"
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-3 text-sm text-neutral-900 outline-none focus:border-neutral-400"
            />

            <button
              onClick={go}
              disabled={busy}
              className={cx(
                "rounded-xl px-5 py-3 text-sm font-semibold text-white",
                busy ? "bg-neutral-400" : "bg-neutral-900 hover:bg-neutral-800"
              )}
            >
              {busy ? "Yönlendiriliyor…" : "Analiz Et"}
            </button>
          </div>

          {err ? (
            <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {err}
            </div>
          ) : (
            <div className="mt-3 text-xs text-neutral-500">
              Linkten veri alınamazsa manuel fiyat ekleyebilirsin.
            </div>
          )}
        </div>

        {/* Banner area (kilitli reklam alanı) */}
        <div className="mt-5 rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
          <div className="text-xs font-semibold text-neutral-700">Banner Alanı</div>
          <div className="mt-1 text-xs text-neutral-600">
            Yakında burada markalar olacak. Şimdilik: <span className="font-semibold text-neutral-900">Bikonomi öneriyor</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-xs text-neutral-500">
          <div>Bikonomi farklı kaynaklardan veri toplar.</div>
          <div>Reklam değil, analiz.</div>
          <div>Son karar kullanıcıya aittir.</div>
        </div>
      </div>
    </div>
  );
}
