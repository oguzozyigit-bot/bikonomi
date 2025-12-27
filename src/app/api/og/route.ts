// src/app/api/og/route.ts
import { ImageResponse } from "next/og";

export const runtime = "edge"; // OG için en stabil seçenek

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function decide(score: number) {
  if (score >= 80) return "ALINIR";
  if (score >= 65) return "DİKKAT";
  return "ALINMAZ";
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const scoreRaw = Number(searchParams.get("score") ?? "0");
  const score = clamp(Number.isFinite(scoreRaw) ? scoreRaw : 0, 0, 100);

  const decisionRaw = (searchParams.get("decision") || "").toUpperCase();
  const decision =
    decisionRaw === "ALINIR" || decisionRaw === "DİKKAT" || decisionRaw === "ALINMAZ"
      ? (decisionRaw as "ALINIR" | "DİKKAT" | "ALINMAZ")
      : decide(score);

  const title = (searchParams.get("title") || "Bikonomi")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 70);

  const subtitle = (searchParams.get("sub") || "Akıllı alışveriş kararı.").trim().slice(0, 80);

  const badgeBg =
    decision === "ALINIR" ? "#16a34a" : decision === "DİKKAT" ? "#f59e0b" : "#ef4444";

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 56,
          background: "linear-gradient(135deg, #064e3b 0%, #0ea5a4 100%)",
          color: "white",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"',
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 900,
            }}
          >
            b
          </div>
          <div style={{ fontSize: 40, fontWeight: 900, letterSpacing: -1 }}>Bikonomi</div>
          <div
            style={{
              marginLeft: "auto",
              padding: "10px 14px",
              borderRadius: 999,
              background: badgeBg,
              fontSize: 22,
              fontWeight: 900,
            }}
          >
            {decision}
          </div>
        </div>

        {/* Title */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 46, fontWeight: 900, lineHeight: 1.1 }}>{title}</div>
          <div style={{ fontSize: 24, opacity: 0.9 }}>{subtitle}</div>
        </div>

        {/* Score card */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: 18,
            padding: 26,
            borderRadius: 28,
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 18, opacity: 0.85 }}>Bikonomi Skoru</div>
            <div style={{ fontSize: 84, fontWeight: 950, lineHeight: 1 }}>{score}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, textAlign: "right" }}>
            <div style={{ fontSize: 18, opacity: 0.85 }}>Paylaş</div>
            <div style={{ fontSize: 22, fontWeight: 700, opacity: 0.95 }}>
              www.bikonomi.com
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
      },
    }
  );
}
