import { Suspense } from "react";
import CheckClient from "./ui";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0b1020] text-slate-200 p-6">Yükleniyor…</div>}>
      <CheckClient />
    </Suspense>
  );
}
