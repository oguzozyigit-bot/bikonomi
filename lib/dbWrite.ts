import { prisma } from "@/lib/prisma";
import { NormalizedProduct, computeCheapest } from "@/lib/normalize";

export async function upsertProductWithOffers(np: NormalizedProduct) {
  const cheapest = computeCheapest(np.offers);

  // 1) Product upsert
  const product = await prisma.product.upsert({
    where: { url: np.url },
    create: {
      url: np.url,
      source: np.source,
      sourceProductId: np.sourceProductId,
      title: np.title,
      category: np.category,
      currency: np.currency,
      cheapestPrice: cheapest?.cheapestPrice ?? null,
      cheapestStore: cheapest?.cheapestStore ?? null,
      score: 0,
    },
    update: {
      title: np.title,
      category: np.category,
      currency: np.currency,
      cheapestPrice: cheapest?.cheapestPrice ?? null,
      cheapestStore: cheapest?.cheapestStore ?? null,
    },
  });

  // 2) Offer’ları “yeniden yaz” (kolay ve güvenli yöntem)
  // (İstersen store+price unique yapıp upsert de yaparız; bugün hız)
  await prisma.offer.deleteMany({ where: { productId: product.id } });

  if (np.offers.length) {
    await prisma.offer.createMany({
      data: np.offers.map(o => ({
        productId: product.id,
        store: o.store,
        price: o.price,
        shipping: o.shipping ?? 0,
        inStock: o.inStock ?? true,
        sellerName: o.sellerName,
        sellerScore: o.sellerScore,
        url: o.url,
      })),
    });
  }

  // 3) PricePoint ekle (cheapestPrice varsa)
  if (cheapest?.cheapestPrice) {
    await prisma.pricePoint.create({
      data: {
        productId: product.id,
        date: new Date(),
        price: cheapest.cheapestPrice,
        currency: np.currency,
      },
    });
  }

  return product;
}
