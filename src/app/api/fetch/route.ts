import { NextResponse } from "next/server";
import { fetchByUrl } from "@/lib/sources";

export const runtime = "nodejs"; // HTML parse için rahat

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "url param zorunlu" }, { status: 400 });
  }

  try {
    const data = await fetchByUrl(url);

    return NextResponse.json(data, {
      headers: {
        // Vercel CDN cache: 10 dk, SWR 1 saat
        "Cache-Control": "s-maxage=600, stale-while-revalidate=3600",
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "fetch failed", detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
