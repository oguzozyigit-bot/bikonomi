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
};

export default async function DemoPage({
  searchParams,
}: {
  searchParams: { url?: string };
}) {
  const url = searchParams?.url?.trim();
  if (!url) return <div>URL yok</div>;

  let data: FetchResp | null = null;

  try {
    // 🔒 MUTLAK YOL: internal fetch
    const res = await fetch(
      `${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ""}/api/fetch?url=${encodeURIComponent(url)}`,
      { cache: "no-store" }
    );
    data = await res.json();
  } catch (e: any) {
    data = { error: e?.message ?? "fetch failed" };
  }

  const p = data?.product;

  return (
    <main style={{ padding: 24 }}>
      <h1>Bikonomi Demo</h1>

      {!p ? (
        <pre>{JSON.stringify(data, null, 2)}</pre>
      ) : (
        <div>
          <h2>{p.title}</h2>
          <p>
            Fiyat:{" "}
            {typeof p.price === "number"
              ? `${p.price.toFixed(2)} ${p.currency}`
              : "—"}
          </p>
          {p.image && <img src={p.image} style={{ maxWidth: 200 }} />}
          <br />
          <a href={p.url} target="_blank">Ürüne git</a>
        </div>
      )}
    </main>
  );
}
