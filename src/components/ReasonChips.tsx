export default function ReasonChips({ reasons }: { reasons: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {reasons.map((r) => (
        <span
          key={r}
          className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/90"
        >
          {r}
        </span>
      ))}
    </div>
  );
}
