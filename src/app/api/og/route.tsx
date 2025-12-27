import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const score = searchParams.get("score") ?? "72";
  const decision = searchParams.get("decision") ?? "DİKKAT";
  const title = searchParams.get("title") ?? "Bikonomi Skoru";

  // ❗️ÖNEMLİ: JSX DOĞRUDAN veriliyor, FUNCTION YOK
  const element = (
    <div
      style={{
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0f766e",
        color: "white",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{ fontSize: "56px", fontWeight: 800, marginBottom: "24px" }}>
        Bikonomi
      </div>

      <div style={{ fontSize: "40px", marginBottom: "12px" }}>
        {title}
      </div>

      <div style={{ fontSize: "72px", fontWeight: 900, marginBottom: "12px" }}>
        {score}
      </div>

      <div
        style={{
          padding: "12px 32px",
          borderRadius: "999px",
          backgroundColor: "#111827",
          fontSize: "32px",
          fontWeight: 700,
        }}
      >
        {decision}
      </div>
    </div>
  );

  return new ImageResponse(element, {
    width: 1200,
    height: 630,
  });
}
