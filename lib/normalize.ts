export type NormalizedOffer = {
  store: string;
  price: number;
  shipping?: number;
  inStock?: boolean;
  sellerName?: string;
  sellerScore?: number;
  url?: string;
};

export type NormalizedProduct = {
  source: string;
  sourceProductId?: string;
  url: string;
  title: string;
  category?: string;
  currency: string; // "TRY"
  offers: NormalizedOffer[];
};

export function computeCheapest(offers: NormalizedOffer[]) {
  const valid = offers
    .filter(o => Number.isFinite(o.price))
    .map(o => ({ ...o, shipping: o.shipping ?? 0 }));
  if (!valid.length) return null;

  valid.sort((a, b) => (a.price + (a.shipping ?? 0)) - (b.price + (b.shipping ?? 0)));
  const c = valid[0];
  return {
    cheapestPrice: c.price + (c.shipping ?? 0),
    cheapestStore: c.store,
  };
}
