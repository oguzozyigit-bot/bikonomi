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

  let data: FetchResp | null = null;

  try {
    const res = await fetch(
      `/api/fetch?url=${encodeURIComponent(url)}`,
      { cache: "no-store" }
    );
    data = await res.json();
  } catch (e: any) {
    data = { error: "fetch_failed", message: e?.message };
  }

  const p = data?.product;

  return (
    <main style={{ padding: 24, maxWidth: 800 }}>
      <h1>Bikonomi Demo</h1>

      {!p ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <div style={{ border: "1px solid #ddd", padding: 16 }}>
          <h2>{p.title ?? "Başlık yok"}</h2>

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
              style={{ maxWidth: 200 }}
            />
          ) : (
            <p>Görsel yok</p>
          )}

          <p style={{ fontSize: 12 }}>
            Kaynak: {data?.source ?? "-"}
          </p>

          <a href={p.url} target="_blank" rel="noreferrer">
            Ürüne git →
          </a>
        </div>
      )}
    </main>
  );
}
