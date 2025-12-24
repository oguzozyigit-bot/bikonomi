// src/app/check/page.tsx
import { Suspense } from "react";
import CheckClient from "./CheckClient";

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Yükleniyor…</div>}>
      <CheckClient />
    </Suspense>
  );
}
