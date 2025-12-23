import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: { offers: true, pricePoints: { orderBy: { date: "desc" }, take: 30 } },
  });

  if (!product) return <div>Ürün bulunamadı</div>;

  return (
    <div>
      <h1>{product.title}</h1>
      <div>En ucuz: {product.cheapestPrice ?? "-"} {product.currency}</div>
      <div>Mağaza: {product.cheapestStore ?? "-"}</div>
      <div>Skor: {product.score}</div>

      <hr />

      <h3>Teklifler</h3>
      <ul>
        {product.offers.map(o => (
          <li key={o.id}>
            {o.store} — {o.price} {product.currency} {o.inStock ? "" : "(stok yok)"}
          </li>
        ))}
      </ul>
    </div>
  );
}
