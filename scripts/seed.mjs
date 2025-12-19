import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9çğıöşü\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

// basit “trend” üretici: basePrice etrafında yumuşak dalga
function priceAt(base, factor) {
  return Math.max(1, Math.round(base * factor));
}

async function upsertProduct(title) {
  const slug = slugify(title);
  return prisma.product.upsert({
    where: { slug },
    update: { title },
    create: { slug, title },
  });
}

async function upsertOffer({ productId, source, sourceOfferId, url, sellerName, priceNow }) {
  return prisma.offer.upsert({
    where: { source_sourceOfferId: { source, sourceOfferId } },
    update: {
      productId,
      url,
      sellerName,
      price: priceNow,
      shippingPrice: 0,
      inStock: true,
      titleRaw: sourceOfferId,
      currency: "TRY",
    },
    create: {
      productId,
      source,
      sourceOfferId,
      url,
      sellerName,
      titleRaw: sourceOfferId,
      currency: "TRY",
      price: priceNow,
      shippingPrice: 0,
      inStock: true,
    },
  });
}

async function replaceSnapshots(offerId, snapshots) {
  // aynı offer için eski snapshotları temizle (duplicate olmasın)
  await prisma.priceSnapshot.deleteMany({ where: { offerId } });

  for (const s of snapshots) {
    await prisma.priceSnapshot.create({
      data: {
        offerId,
        price: s.price,
        shippingPrice: 0,
        inStock: true,
        capturedAt: s.capturedAt,
      },
    });
  }
}

// İstenen tarih seti:
// Günlük: bugün(0), dün(1)
// Haftalık: 1, 7, 14, 21, 28 gün (son 4 hafta + bugün referans olsun diye 28 dahil)
// Aylık: 30,60,...,360 gün (son 12 ay yaklaşık) + bugün
function buildSnapshotDates() {
  const set = new Map();

  // günlük
  set.set(0, daysAgo(0));
  set.set(1, daysAgo(1));

  // haftalık (4 hafta)
  [7, 14, 21, 28].forEach(d => set.set(d, daysAgo(d)));

  // aylık (12 ay ~ 30 gün)
  for (let m = 1; m <= 12; m++) {
    set.set(m * 30, daysAgo(m * 30));
  }

  // en yeni -> en eski sıralama (UI’de iyi dursun)
  return [...set.entries()]
    .sort((a, b) => a[0] - b[0]) // küçük gün önce -> büyük gün önce
    .map(([days, dt]) => ({ days, dt }));
}

async function seedOneProduct(title, baseToday, baseYesterday) {
  const product = await upsertProduct(title);
  const slug = slugify(title);

  // 3 pazaryeri (fiyat farkı: demo)
  const marketplaces = [
    {
      source: "trendyol",
      sellerName: "Trendyol Satıcı",
      url: `https://www.trendyol.com/sr?q=${encodeURIComponent(title)}`,
      todayFactor: 1.00,
    },
    {
      source: "hepsiburada",
      sellerName: "Hepsiburada Satıcı",
      url: `https://www.hepsiburada.com/ara?q=${encodeURIComponent(title)}`,
      todayFactor: 1.03,
    },
    {
      source: "amazon",
      sellerName: "Amazon Satıcı",
      url: `https://www.amazon.com.tr/s?k=${encodeURIComponent(title)}`,
      todayFactor: 0.99,
    },
  ];

  const dates = buildSnapshotDates();

  for (const mp of marketplaces) {
    const priceToday = priceAt(baseToday, mp.todayFactor);
    const priceYesterday = priceAt(baseYesterday, mp.todayFactor);

    const offer = await upsertOffer({
      productId: product.id,
      source: mp.source,
      sourceOfferId: `${slug}-${mp.source}`,
      url: mp.url,
      sellerName: mp.sellerName,
      priceNow: priceToday,
    });

    // snapshot fiyatları üret:
    // - bugünkü fiyat: priceToday
    // - dün: priceYesterday
    // - haftalık/aylık: baseToday etrafında dalga (eskiye gittikçe küçük sapmalar)
    const snapshots = dates.map(({ days, dt }) => {
      if (days === 0) return { capturedAt: dt, price: priceToday };
      if (days === 1) return { capturedAt: dt, price: priceYesterday };

      // haftalık/aylık noktalar için deterministik dalga:
      // örn 7g önce: %±2, 30g önce: %±4 gibi büyüyen sapma
      const amp = Math.min(0.10, 0.02 + days / 1000); // maksimum %10
      const wave = Math.sin(days / 7) * amp;          // dalga
      const price = priceAt(priceToday, 1 - wave);    // eskiye göre biraz farklı
      return { capturedAt: dt, price };
    });

    await replaceSnapshots(offer.id, snapshots);
  }
}

async function main() {
  await seedOneProduct("Apple iPhone 15 128GB Siyah", 1400000, 2000000);
  await seedOneProduct("Apple iPhone 14 128GB", 1700000, 1650000);
  await seedOneProduct("Samsung Galaxy S23 256GB", 1500000, 1580000);
  await seedOneProduct("Ayçiçek Yağı 5L", 39000, 43000);
  await seedOneProduct("Çamaşır Deterjanı 7kg", 34900, 36900);

  console.log("Seed OK (daily+weekly+monthly + marketplaces)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
