export const dynamic = "force-dynamic";

import { Suspense } from "react";
import AnalyzeClient from "./AnalyzeClient";

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div className="p-6">Analiz ediliyor…</div>}>
      <AnalyzeClient />
    </Suspense>
  );
}
