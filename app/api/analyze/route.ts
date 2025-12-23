export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const url = (body?.url ?? "").toString().trim();
  if (!url) return NextResponse.json({ ok: false, error: "url_required" }, { status: 400 });

  return NextResponse.json({
    ok: true,
    id: crypto.randomUUID(),
    score: 72
  });
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
