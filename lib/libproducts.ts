export type Product = {
  id: string;
  title: string;
  imageUrl: string;
  category: string;
  cheapestPrice: number;
  score: number;
  breakdown: {
    priceScore: number;
    trustScore: number;
    qualityScore: number;
    cheapestTotal: number;
    medianTotal: number;
    offersInStock: number;
  };
};

export const PRODUCTS: Product[] = [
  {
    id: "ld-001",
    title: "Kahve Makinesi X100",
    imageUrl: "https://picsum.photos/seed/bikonomi1/600/400",
    category: "Elektronik",
    cheapestPrice: 3299,
    score: 78,
    breakdown: {
      priceScore: 82,
      trustScore: 74,
      qualityScore: 77,
      cheapestTotal: 3299,
      medianTotal: 3599,
      offersInStock: 7,
    },
  },
  {
    id: "ld-002",
    title: "Dikey Süpürge Pro",
    imageUrl: "https://picsum.photos/seed/bikonomi2/600/400",
    category: "Ev",
    cheapestPrice: 4999,
    score: 86,
    breakdown: {
      priceScore: 84,
      trustScore: 83,
      qualityScore: 90,
      cheapestTotal: 4999,
      medianTotal: 5299,
      offersInStock: 5,
    },
  },
  {
    id: "ld-003",
    title: "Kulaklık AirBeat",
    imageUrl: "https://picsum.photos/seed/bikonomi3/600/400",
    category: "Elektronik",
    cheapestPrice: 899,
    score: 67,
    breakdown: {
      priceScore: 70,
      trustScore: 62,
      qualityScore: 69,
      cheapestTotal: 899,
      medianTotal: 999,
      offersInStock: 12,
    },
  },
];

export function getFeaturedProducts() {
  return PRODUCTS.filter((p) => p.score >= 70).sort((a, b) => b.score - a.score).slice(0, 5);
}

export function getProductById(id: string) {
  return PRODUCTS.find((p) => p.id === id) ?? null;
}
