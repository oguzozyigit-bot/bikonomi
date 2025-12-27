import { Suspense } from "react";
import type { Metadata } from "next";
import CheckClient from "./CheckClient";

const site =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://www.bikonomi.com";

export function generateMetadata({
  searchParams,
}: {
  searchParams: { u?: string; v?: string };
}): Metadata {
  const u = (searchParams?.u || "").trim();
  const v = (searchParams?.v || "").trim();

  // cache kırmak için v'yi OG URL'e ekliyoruz
  const og = u
    ? `/api/og?u=${encodeURIComponent(u)}${v ? `&v=${encodeURIComponent(v)}` : ""}`
    : "/og.png";

  return {
    metadataBase: new URL(site),
    title: "Bikonomi — Akıllı alışveriş kararı",
    description: "Ürün linkini yapıştır, skorunu gör, ALINIR/DİKKAT/ALINMAZ kararını al.",
    openGraph: {
      title: "Bikonomi — Akıllı alışveriş kararı",
      description: "Ürün linkini yapıştır, skorunu gör.",
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [og],
    },
  };
}

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Yükleniyor…</div>}>
      <CheckClient />
    </Suspense>
  );
}
