import { NextResponse } from "next/server";
import { fetchTrendyol } from "@/lib/sources/trendyol";
import { fetchHepsiburada } from "@/lib/sources/hepsiburada";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function detectSource(url: URL): "trendyol" | "hepsiburada" | null {
  const h = url.hostname.replace(/^www\./, "");
  if (h.includes("trendyol.com")) return "trendyol";
  if (h.includes("hepsiburada.com")) return "hepsiburada";
  return null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("url")?.trim();

  if (!raw) {
    return NextResponse.json({ error: "url parametresi gerekli" }, { status: 400 });
  }

  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return NextResponse.json({ error: "Geçersiz URL" }, { status: 400 });
  }

  const source = detectSource(u);
  if (!source) {
    return NextResponse.json({ error: "Desteklenmeyen kaynak", url: u.toString() }, { status: 400 });
  }

  try {
    const data =
      source === "trendyol"
        ? await fetchTrendyol(u.toString())
        : await fetchHepsiburada(u.toString());

    // GARANTİ ŞEKLİ: product nesnesi her zaman bu alanları taşır
    return NextResponse.json(
      {
        source,
        product: {
          title: data.product.title ?? "",
          price: typeof data.product.price === "number" ? data.product.price : null,
          currency: data.product.currency ?? "TRY",
          url: data.product.url ?? u.toString(),
          image: data.product.image ?? null,
        },
        debug: data.debug ?? undefined,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        error: "fetch_failed",
        message: e?.message ?? "Bilinmeyen hata",
        url: u.toString(),
      },
      { status: 500 }
    );
  }
}
