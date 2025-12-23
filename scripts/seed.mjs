import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

console.log("🟢 seed.mjs başladı");

// __dirname eşdeğeri
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// JSON’u dosyadan oku (import assertion yok)
const jsonPath = path.join(__dirname, "..", "lib", "seedProducts.json");
const seedProducts = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

console.log("🧾 ürün sayısı:", seedProducts.length);

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL, // prisma+postgres://...
}).$extends(withAccelerate());

async function main() {
  for (const p of seedProducts) {
    console.log("➡️ upsert:", p.id);

    await prisma.product.upsert({
      where: { id: p.id },
      update: {
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
      create: {
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
  .catch((e) => {
    console.error("❌ Seed hata:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
