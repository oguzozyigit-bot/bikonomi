"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AnalyzeClient() {
  const params = useSearchParams();
  const router = useRouter();
  const url = params.get("url");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!url) {
      setErr("Link bulunamadı. Ana sayfadan link yapıştır.");
      return;
    }

    (async () => {
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.ok || !data?.id) {
          setErr("Analiz başarısız. Tekrar dene.");
          return;
        }

        router.push(`/products/${data.id}?score=${data.score}&src=${encodeURIComponent(url)}`);
      } catch {
        setErr("Bağlantı hatası. Tekrar dene.");
      }
    })();
  }, [url, router]);

  return (
    <main className="flex h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="mb-3 text-lg font-semibold">
          {err ? "Bir şey ters gitti" : "Analiz ediliyor…"}
        </div>
        <div className="text-sm text-gray-500">
          {err ? err : "Fiyat, güven ve kalite sinyalleri hesaplanıyor"}
        </div>
      </div>
    </main>
  );
}
