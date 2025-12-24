import { Decision, DECISION_LABEL, decisionHint } from "@/lib/decision";

function cls(...a: Array<string | false | null | undefined>) {
  return a.filter(Boolean).join(" ");
}

export default function DecisionBanner({ decision }: { decision: Decision }) {
  const style =
    decision === "ALINIR"
      ? "bg-green-600"
      : decision === "DIKKAT"
      ? "bg-yellow-500 text-black"
      : "bg-red-600";

  const icon = decision === "ALINIR" ? "✅" : decision === "DIKKAT" ? "⚠️" : "⛔";

  return (
    <div className={cls("rounded-2xl p-5 text-white shadow", style)}>
      <div className="flex items-center gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="text-xl font-semibold">{DECISION_LABEL[decision]}</div>
      </div>
      <div className="mt-2 text-sm opacity-95">{decisionHint(decision)}</div>
    </div>
  );
}
