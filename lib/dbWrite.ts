// MVP-0 STUB
// Build'in kırılmaması için geçici olarak devre dışı.
// Gerçek normalize + prisma akışı MVP'den sonra buraya bağlanacak.

export type NormalizedProduct = unknown;

export async function upsertProductWithOffers(_np: NormalizedProduct) {
  return {
    ok: true,
    skipped: true,
    id: "mvp-stub", // ingest route'un beklediği alan
  };
}
