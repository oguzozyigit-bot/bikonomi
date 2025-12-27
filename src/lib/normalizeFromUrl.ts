// src/lib/normalizeFromUrl.ts
import { normalizeUrl } from "@/lib/normalizeUrl";
import { fetchSource } from "@/lib/fetchSource";

export async function normalizeFromUrl(url: string) {
  const { source, cleanUrl, productKey } = normalizeUrl(url);

  // fetchSource cleanUrl + source bekliyor (projendeki analiz route ile aynı)
  const fetched = await fetchSource(cleanUrl, source);

  return {
    productKey,
    source,
    cleanUrl,
    ...fetched,
  };
}
