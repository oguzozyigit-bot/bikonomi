import React from "react";
import { scoreLabel } from "./scoreBadge";

export function ScoreGauge({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const angle = (clamped / 100) * 180; // 0..180

  const { text } = scoreLabel(clamped);

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-gray-600">Bikonomi Score</div>
          <div className="mt-1 text-4xl font-bold tracking-tight">{clamped}</div>
          <div className="mt-1 text-sm font-semibold text-gray-800">{text}</div>
        </div>

        <div className="relative h-20 w-40">
          <div className="absolute inset-0 overflow-hidden rounded-t-full border bg-gray-50">
            <div
              className="absolute bottom-0 left-0 right-0 h-full origin-bottom"
              style={{ transform: `rotate(${angle}deg)` }}
            >
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-gray-900" />
            </div>
          </div>
          <div className="absolute bottom-1 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-gray-900" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 text-xs text-gray-500">
        <div>0</div><div className="text-center">50</div><div className="text-center">70</div><div className="text-right">100</div>
      </div>
    </div>
  );
}
