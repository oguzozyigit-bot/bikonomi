import { headers } from "next/headers";

type FetchResp = {
  source?: string;
  product?: {
    title?: string;
    price?: number | null;
    currency?: string;
    url?: string;
    image?: string | null;
  };
  error?: string;
  message?: string;
};

export default async function DemoPage({
  searchParams,
}: {
  searchParams: { url?: string };
}) {
  const url = searchParams?.url?.trim();

  if (!url) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Bikonomi Demo</h1>
        <p>URL parametresi yok</p>
      </main>
    );
  }

  // ✅ Server Component için ABSOLUTE origin üret
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const origin = host ? `${proto}://${host}` : "";

  let data: FetchResp | null = null;

  try {
    const api = `${origin}/api/fetch?url=${encodeURIComponent(url)}`;
    const res = await fetch(api, { cache: "no-store" });
    data = (await res.json()) as FetchResp;
  } catch (e: any) {
    data = { error: "fetch_failed", message: e?.message ?? "unknown" };
  }

  const p = data?.product;

  return (
    <main style={{ padding: 24, maxWidth: 900 }}>
      <h1>Bikonomi Demo</h1>

      {!p ? (
        <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 12 }}>
          <h2 style={{ marginTop: 0 }}>{p.title ?? "Başlık yok"}</h2>

          <p>
            Fiyat:{" "}
            {typeof p.price === "number"
              ? `${p.price.toFixed(2)} ${p.currency ?? "TRY"}`
              : "—"}
          </p>

          {p.image ? (
            <img
              src={p.image}
              alt={p.title ?? ""}
              style={{ maxWidth: 240, borderRadius: 10, border: "1px solid #eee" }}
            />
          ) : (
            <p>Görsel yok</p>
          )}

          <p style={{ fontSize: 12, opacity: 0.7 }}>
            Kaynak: {data?.source ?? "-"}
          </p>

          <a href={p.url ?? url} target="_blank" rel="noreferrer">
            Ürüne git →
          </a>

          <details style={{ marginTop: 12 }}>
            <summary style={{ cursor: "pointer" }}>Debug</summary>
            <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(data, null, 2)}</pre>
          </details>
        </div>
      )}
    </main>
  );
}
