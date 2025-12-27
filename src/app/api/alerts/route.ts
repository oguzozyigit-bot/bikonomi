export const runtime = "nodejs";

import { NextResponse } from "next/server";

export async function GET() {
  // MVP: Prisma/DB şimdilik kapalı
  return NextResponse.json(
    { ok: true, disabled: true, alerts: [] },
    { headers: { "Cache-Control": "no-store" } }
  );
}

