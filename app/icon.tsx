import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, rgba(43,89,255,.95), rgba(255,122,0,.95))",
          color: "white",
          fontSize: 28,
          fontWeight: 900,
          fontFamily: "system-ui",
        }}
      >
        b
      </div>
    ),
    { width: 64, height: 64 }
  );
}
