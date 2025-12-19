import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9çğıöşü\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export async function POST(req: Request) {
  const body = await req.json();

  const title = String(body.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });

  const slug = body.slug ? String(body.slug) : slugify(title);

  const product = await prisma.product.create({
    data: {
      slug,
      title,
      brand: body.brand ?? null,
      model: body.model ?? null,
      category: body.category ?? null,
      imageUrl: body.imageUrl ?? null,
      attributes: body.attributes ?? null,
    },
  });

  return NextResponse.json({ ok: true, product });
}
