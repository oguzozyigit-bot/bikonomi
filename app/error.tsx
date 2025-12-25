"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main style={{ padding: 16, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontWeight: 900 }}>Uygulama Hatası</h1>
      <p style={{ opacity: 0.8 }}>
        Sunucuda bir hata oluştu. Aşağıdaki mesaj bize hatayı buldurur.
      </p>

      <pre
        style={{
          whiteSpace: "pre-wrap",
          background: "#f7f7f7",
          padding: 12,
          borderRadius: 12,
          border: "1px solid #eee",
        }}
      >
        {error?.message}
        {"\n"}
        Digest: {error?.digest}
      </pre>

      <button
        onClick={() => reset()}
        style={{
          marginTop: 12,
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #ddd",
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        Tekrar dene
      </button>
    </main>
  );
}
