import { prisma } from "@/lib/db";

export async function GET() {
  const products = await prisma.product.findMany({ orderBy: { score: "desc" } });
  return Response.json({ ok: true, products });
}
