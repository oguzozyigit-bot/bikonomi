import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "bikonomi",
  description: "Fiyatı karşılaştırmaz; fiyatı anlamlandırır.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body
        style={{
          margin: 0,
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif",
          background: "#fff",
          color: "#111",
        }}
      >
        {children}
      </body>
    </html>
  );
}
