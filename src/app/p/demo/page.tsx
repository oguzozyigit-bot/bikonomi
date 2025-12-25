import Image from "next/image";

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
  searchParams: Promise<{ url?: string }>;
}) {
  const sp = await searchParams;
  const url = sp?.url?.trim();

  if (!url) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-2xl font-bold">Demo</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          URL parametresi yok. Örnek:
        </p>
        <pre className="mt-3 rounded-lg bg-muted p-3 text-xs overflow-auto">
          /p/demo?url=https://www.trendyol.com/...
        </pre>
      </main>
    );
  }

const api = `/api/fetch?url=${encodeURIComponent(url)}`;

  let data: FetchResp | null = null;
  try {
    const res = await fetch(api, { cache: "no-store" });
    data = (await res.json()) as FetchResp;
  } catch (e: any) {
    data = { error: "fetch_failed", message: e?.message ?? "unknown" };
  }

  const p = data?.product;

  const title = p?.title ?? "Başlık bulunamadı";
  const price =
    typeof p?.price === "number" ? p.price : null;
  const currency = p?.currency ?? "TRY";
  const image = p?.image ?? null;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Bikonomi Demo</h1>

      {data?.error ? (
        <div className="mt-4 rounded-lg border p-4">
          <div className="font-semibold">API Hatası</div>
          <pre className="mt-2 text-xs overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border p-4">
          <div className="grid gap-4 md:grid-cols-[160px_1fr]">
            <div className="relative h-40 w-40 overflow-hidden rounded-xl border bg-muted">
              {image ? (
                // next/image dış domain için next.config.js'te images.remotePatterns gerekebilir.
                // Takılmasın diye unoptimized kullanıyorum:
                <Image
                  src={image}
                  alt={title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                  Görsel yok
                </div>
              )}
            </div>

            <div>
              <div className="text-lg font-semibold">{title}</div>

              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">Fiyat: </span>
                <span className="font-semibold">
                  {price !== null ? `${price.toFixed(2)} ${currency}` : "—"}
                </span>
              </div>

              <div className="mt-2 text-xs text-muted-foreground break-all">
                Kaynak: {data?.source ?? "—"} <br />
                URL: {p?.url ?? url}
              </div>

              <div className="mt-3">
                <a
                  href={p?.url ?? url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm underline"
                >
                  Ürüne git →
                </a>
              </div>
            </div>
          </div>

          <details className="mt-4">
            <summary className="cursor-pointer text-sm">Debug</summary>
            <pre className="mt-2 text-xs overflow-auto rounded-lg bg-muted p-3">
              {JSON.stringify(data, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </main>
  );
}
