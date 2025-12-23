console.log("🟢 seed.cjs başladı");

require("dotenv").config();

const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

// ⚠️ EN KRİTİK KISIM: tek bağlantı + postgres DB
const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_DATABASE_URL,
  max: 1,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000,
});

const prisma = new PrismaClient({ adapter });
const seedProducts = require("../lib/seedProducts.json");

async function main() {
  console.log("🧾 ürün sayısı:", seedProducts.length);

  for (const p of seedProducts) {
    console.log("➡️ upsert:", p.id);

    await prisma.product.create({
      data: {
        id: p.id,
        title: p.title,
        category: p.category,
        score: p.score,
        cheapestPrice: p.cheapestPrice,
        currency: p.currency,
        cheapestStore: p.cheapestStore,
        marketDeltaPct: p.marketDeltaPct,
        history: p.history,
        breakdown: p.breakdown,
        offers: p.offers,
      },
    });
  }

  console.log("✅ Seed DB tamam:", seedProducts.length, "ürün");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("❌ Seed hata:", e.message);
    await prisma.$disconnect();
    process.exit(1);
  });
