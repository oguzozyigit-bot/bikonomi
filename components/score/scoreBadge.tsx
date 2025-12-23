import React from "react";

export function scoreLabel(score: number) {
  if (score >= 85) return { text: "Çok Mantıklı", tone: "violet" as const };
  if (score >= 70) return { text: "Mantıklı Seçim", tone: "green" as const };
  if (score >= 50) return { text: "Düşünülebilir", tone: "yellow" as const };
  return { text: "Mantıksız", tone: "red" as const };
}

export function ScoreBadge({ score }: { score: number }) {
  const { text, tone } = scoreLabel(score);
  const cls =
    tone === "green"
      ? "bg-green-100 text-green-800"
      : tone === "violet"
      ? "bg-violet-100 text-violet-800"
      : tone === "yellow"
      ? "bg-yellow-100 text-yellow-800"
      : "bg-red-100 text-red-800";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      {score} · {text}
    </span>
  );
}
