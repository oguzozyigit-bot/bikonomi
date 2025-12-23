import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  console.log("🌱 Seeding started...");

  const nowIso = new Date().toISOString();

  const products = [
    {
      id: "p-iphone-15-128",
      title: "Apple iPhone 15 128 GB",
      category: "Telefon",
      score: 78,
      cheapestPrice: 58999,
      currency: "TRY",
      cheapestStore: "Trendyol",
      marketDeltaPct: 12,
    },
    {
      id: "p-airfryer-xxl",
      title: "Airfryer XXL 7L",
      category: "Ev & Yaşam",
      score: 66,
      cheapestPrice: 3299,
      currency: "TRY",
      cheapestStore: "Hepsiburada",
      marketDeltaPct: 5,
    },
    {
      id: "p-kahve-makinesi",
      title: "Espresso Kahve Makinesi",
      category: "Mutfak",
      score: 72,
      cheapestPrice: 7499,
      currency: "TRY",
      cheapestStore: "Amazon TR",
      marketDeltaPct: 8,
    },
  ];

  for (const p of products) {
    const history = {
      currency: p.currency,
      points: [
        { date: "2025-11-22", price: Math.max(1, p.cheapestPrice + 1000) },
        { date: "2025-12-22", price: p.cheapestPrice },
      ],
      updatedAt: nowIso,
    };

    const breakdown = {
      cheapestTotal: p.cheapestPrice,
      medianTotal: p.cheapestPrice,
      offersInStock: 1,
      priceScore: Math.min(100, Math.max(0, Math.round(p.score * 0.4))),
      qualityScore: Math.min(100, Math.max(0, Math.round(p.score * 0.4))),
      trustScore: Math.min(100, Math.max(0, Math.round(p.score * 0.2))),
      updatedAt: nowIso,
    };

    const offers = [
      {
        store: p.cheapestStore,
        price: p.cheapestPrice,
        currency: p.currency,
        inStock: true,
        url: "https://example.com",
        updatedAt: nowIso,
      },
    ];

    const data = {
      title: p.title,
      category: p.category,
      score: p.score,
      cheapestPrice: p.cheapestPrice,
      currency: p.currency, // default var ama yazmak daha net
      cheapestStore: p.cheapestStore,
      marketDeltaPct: p.marketDeltaPct,
      history,
      breakdown,
      offers,
    };

    await prisma.product.upsert({
      where: { id: p.id },
      update: data,
      create: { id: p.id, ...data },
    });
  }

  const count = await prisma.product.count();
  console.log(`✅ Seeding finished. productCount=${count}`);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
