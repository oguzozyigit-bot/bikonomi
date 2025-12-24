export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET() {
  // BUGÜN: sadece build’i yeşile kaldıran stub
  return NextResponse.json({ ok: true });
}
