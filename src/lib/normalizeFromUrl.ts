import { normalizeUrl } from "@/lib/normalizeUrl";
import { fetchBySource } from "@/lib/sources";

export async function normalizeFromUrl(url: string) {
  const { source, clean } = normalizeUrl(url);

  const res = await fetchBySource(source as any, clean);

  return {
    source,
    clean,
    product: res.product,
    debug: res.debug,
  };
}
