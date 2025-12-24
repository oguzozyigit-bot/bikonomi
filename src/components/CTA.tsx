"use client";

import { Decision } from "@/lib/decision";
import { useState } from "react";

function cls(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export default function CTA({
  decision,
  buyUrl,
}: {
  decision: Decision;
  buyUrl: string;
}) {
  const [toast, setToast] = useState<string | null>(null);

  function show(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  }

  if (decision === "ALINMAZ") {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
        <div className="flex items-center gap-2 text-red-200">
          <span className="text-lg">🔒</span>
          <span className="font-semibold">
            Bikonomi bu ürünü satın almana izin vermez.
          </span>
        </div>
        <div className="mt-2 text-sm text-red-100/80">
          Tüketiciyi korumak Bikonomi’nin önceliğidir.
        </div>
      </div>
    );
  }

  if (decision === "DIKKAT") {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <a
          href={buyUrl}
          className="inline-flex items-center justify-center rounded-xl bg-yellow-500 px-4 py-3 text-sm font-semibold text-black shadow hover:opacity-95"
        >
          Riski Göze Al &amp; Satın Al
        </a>
        <button
          onClick={() => show("Ürün takibe alındı.")}
          className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10"
        >
          Takibe Al
        </button>

        {toast && (
          <div className="fixed bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-sm text-white shadow">
            {toast}
          </div>
        )}
      </div>
    );
  }

  // ALINIR
  return (
    <a
      href={buyUrl}
      className="inline-flex items-center justify-center rounded-xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow hover:opacity-95"
    >
      Satın Al
    </a>
  );
}
