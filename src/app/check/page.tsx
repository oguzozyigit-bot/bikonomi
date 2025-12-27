import { Suspense } from "react";
import CheckClient from "./CheckClient";

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Yükleniyor…</div>}>
      <CheckClient />
    </Suspense>
  );
}
