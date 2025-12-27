import type { Metadata } from "next";
import HomeClient from "./ui";

export const metadata: Metadata = {
  title: "Bikonomi – Almadan önce bak.",
  description: "Aynı ürün, farklı fiyat. Reklam değil, analiz.",
};

export default function Page() {
  return <HomeClient />;
}
