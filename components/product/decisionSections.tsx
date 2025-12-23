import React from "react";
import { scoreLabel } from "../score/scoreBadge";

export function AiInsight({ score }: { score: number }) {
  const s = Math.max(0, Math.min(100, score));
  const { text } = scoreLabel(s);

  let line2 = "Bugünkü fiyatıyla dengeli; acele gerektirmez.";
  if (s >= 85) line2 = "Bugünkü koşullarda güçlü bir tercih; benzerlerine göre önde.";
  else if (s >= 70) line2 = "Fiyat/denge tarafında mantıklı; günlük kullanım için uygun.";
  else if (s >= 50) line2 = "Karar öncesi alternatiflere göz atmak mantıklı olabilir.";
  else line2 = "Fiyat ve güven sinyalleri zayıf; alternatif önerilir.";

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-gray-600">Bikonomi Ne Diyor?</div>
      <p className="mt-2 text-sm leading-6 text-gray-800">
        Bu ürün <span className="font-semibold">{text.toLowerCase()}</span>. {line2}
      </p>
    </div>
  );
}

export function WhoShouldBuy({ score }: { score: number }) {
  const s = Math.max(0, Math.min(100, score));

  const good = [
    "Fiyat–performans arayanlar",
    "Günlük kullanım isteyenler",
    "Markadan çok faydaya bakanlar",
  ];

  const bad =
    s >= 70
      ? ["Premium beklentisi çok yüksek olanlar", "Sırf marka için alanlar"]
      : ["Premium arayanlar", "Risk sevmeyenler", "Sırf marka için alanlar"];

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-gray-600">Bunu kim almalı?</div>

      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <div className="text-sm font-semibold text-gray-900">Uygunsa</div>
          <ul className="mt-2 space-y-2 text-sm text-gray-800">
            {good.map((x) => (
              <li key={x} className="flex gap-2"><span>✔</span><span>{x}</span></li>
            ))}
          </ul>
        </div>

        <div>
          <div className="text-sm font-semibold text-gray-900">Uygun değilse</div>
          <ul className="mt-2 space-y-2 text-sm text-gray-800">
            {bad.map((x) => (
              <li key={x} className="flex gap-2"><span>✖</span><span>{x}</span></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
