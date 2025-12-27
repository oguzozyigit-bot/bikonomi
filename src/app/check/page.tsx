import { Suspense } from "react";
import type { Metadata } from "next";
import CheckClient from "./CheckClient";

const site =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.bikonomi.com";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: "Bikonomi — Akıllı alışveriş kararı",
  description: "Ürün linkini yapıştır, skorunu gör, ALINIR/DİKKAT/ALINMAZ kararını al.",
  openGraph: {
    title: "Bikonomi — Akıllı alışveriş kararı",
    description: "Ürün linkini yapıştır, skorunu gör.",
    images: [
      {
        // varsayılan (fallback)
        url: "/api/og?score=72&decision=D%C4%B0KKAT&title=Bikonomi%20Skoru",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/api/og?score=72&decision=D%C4%B0KKAT&title=Bikonomi%20Skoru"],
  },
};

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Yükleniyor…</div>}>
      <CheckClient />
    </Suspense>
  );
}
