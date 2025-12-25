import { NextResponse } from "next/server";
import { fetchByUrl } from "@/lib/sources";
import { fetchHtml } from "@/lib/sources/http";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("url");
  const debug = searchParams.get("debug") === "1";

  if (!raw) {
    return NextResponse.json({ ok: false, error: "url param zorunlu" }, { status: 400 });
  }

  // Debug mod: sadece HTML çekiminin HTTP durumunu göster (parse etmeden)
  // Not: HTML içeriği döndürmüyoruz; sadece teşhis için status/durum.
  if (debug) {
    try {
      const r = await fetchHtml(raw);
      return NextResponse.json(
        {
          ok: r.ok,
          debug: true,
          status: r.status,
          statusText: r.statusText,
          blockedHint: r.blockedHint ?? null,
        },
        { status: r.ok ? 200 : 502 }
      );
    } catch (e: any) {
      return NextResponse.json(
        { ok: false, debug: true, error: "debug fetch failed", detail: e?.message ?? String(e) },
        { status: 500 }
      );
    }
  }

  // Normal mod: kaynağı tespit et + parse et
  try {
    const data = await fetchByUrl(raw);
    return NextResponse.json(
      { ok: true, data },
      {
        headers: {
          "Cache-Control": "s-maxage=300, stale-while-revalidate=1800",
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "fetch failed", detail: e?.message ?? String(e) },
      { status: 500 }
    );
  }
}
