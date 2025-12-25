// src/app/p/demo/page.tsx
import { Suspense } from "react";
import DemoClient from "./DemoClient";

export const dynamic = "force-dynamic";

export default function DemoPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-3xl p-6">
          <div className="rounded-2xl border bg-white p-5">Yükleniyor…</div>
        </main>
      }
    >
      <DemoClient />
    </Suspense>
  );
}
