export const runtime = "nodejs";

import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.redirect(new URL("/og.png", "https://www.bikonomi.com"), 302);
}
