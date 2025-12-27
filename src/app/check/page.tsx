import { Suspense } from "react";
import CheckClient from "./ui";

export const metadata = {
  title: "Bikonomi – Analiz",
  robots: { index: false, follow: false }, // /check noindex
};

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-neutral-500">Yükleniyor…</div>}>
      <CheckClient />
    </Suspense>
  );
}
