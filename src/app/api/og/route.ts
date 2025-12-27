import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const score = searchParams.get("score") ?? "72";
  const decision = searchParams.get("decision") ?? "DİKKAT";
  const title = searchParams.get("title") ?? "Bikonomi Skoru";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#0f766e",
          color: "white",
          fontSize: 48,
          fontWeight: 700,
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 24 }}>Bikonomi</div>
        <div style={{ fontSize: 40, marginBottom: 12 }}>{title}</div>
        <div style={{ fontSize: 72, marginBottom: 12 }}>{score}</div>
        <div
          style={{
            padding: "12px 32px",
            borderRadius: 999,
            background: "#111827",
            fontSize: 32,
          }}
        >
          {decision}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
