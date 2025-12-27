export default function LogoLock() {
  return (
    <div className="flex items-center gap-3">
      {/* Basit logo placeholder: 3 çizgi + Bikonomi */}
      <div className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 grid place-items-center">
        <div className="flex flex-col gap-1">
          <span className="block h-[2px] w-5 bg-white/80 rounded" />
          <span className="block h-[2px] w-5 bg-white/80 rounded" />
          <span className="block h-[2px] w-5 bg-white/80 rounded" />
        </div>
      </div>

      <div className="leading-tight">
        <div className="text-lg font-semibold tracking-tight">Bikonomi</div>
        <div className="text-xs text-white/50">Akıllı fiyat analizi</div>
      </div>
    </div>
  );
}
