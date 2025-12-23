// components/LinkPasteBox.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LinkPasteBox() {
  const router = useRouter();
  const [url, setUrl] = useState("");

  const goAnalyze = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    router.push(`/analyze?url=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Ürün linkini yapıştır"
        className="w-full rounded-2xl border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
      />

      <button
        onClick={goAnalyze}
        className="rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white"
      >
        Analiz Et
      </button>
    </div>
  );
}
