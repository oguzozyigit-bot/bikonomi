import { NextResponse } from "next/server";
import { fetchByUrl } from "@/lib/sources";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ ok: false, error: "url param zorunlu" }, { status: 400 });
  }

  try {
    const data = await fetchByUrl(url);

    return NextResponse.json(
      { ok: true, data },
      {
        headers: {
          "Cache-Control": "s-maxage=600, stale-while-revalidate=3600",
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "fetch failed",
        detail: e?.message ?? String(e),
      },
      { status: 500 }
    );
  }
}
