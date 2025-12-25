type Props = { params: Promise<{ id: string }> };

export default async function ProductPage({ params }: Props) {
  const { id } = await params;

  // Tasarım demo verisi (UI kilitli kalsın diye)
  const product = demoProduct(id);

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* header */}
      <header className="mx-auto flex max-w-md items-center justify-between px-5 pt-6">
        <div className="flex items-center gap-2">
          <BrandMark />
          <span className="text-lg font-semibold tracking-tight">Bikonomi</span>
        </div>
        <Menu />
      </header>

      {/* url bar */}
      <section className="mx-auto max-w-md px-5 pt-4">
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
          <span className="text-neutral-500"><LinkIcon /></span>
          <div className="flex-1 truncate text-sm text-neutral-500">
            {product.inputUrl}
          </div>
          <span className="rounded-lg bg-neutral-100 px-2 py-1 text-xs text-neutral-600">
            ↻
          </span>
        </div>
      </section>

      {/* main cards */}
      <section className="mx-auto max-w-md px-5 pt-5">
        <div className="grid grid-cols-2 gap-3">
          {/* product card */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
            <div className="aspect-square w-full rounded-xl bg-neutral-50 flex items-center justify-center">
              <ProductImagePlaceholder />
            </div>
            <div className="mt-3 text-sm font-semibold leading-5">
              {product.title}
            </div>
            <div className="mt-2 text-xs text-neutral-500">
              Linkten eşleşen fiyatlar
            </div>

            <div className="mt-3 flex items-center justify-between rounded-xl bg-neutral-50 px-3 py-2">
              <span className="text-xs font-semibold text-orange-600">hepsiburada</span>
              <span className="text-sm font-semibold">{product.bestPrice}</span>
            </div>

            <button className="mt-3 w-full rounded-xl border border-neutral-200 bg-white py-2 text-sm font-semibold text-neutral-700">
              SATIN AL
            </button>
          </div>

          {/* trust card */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
            <div className="text-sm font-semibold text-neutral-700">En Uygun Fiyat:</div>
            <div className="mt-1 text-2xl font-bold text-emerald-700">{product.bestPrice}</div>
            <div className="mt-1 text-xs text-neutral-500">Piyasa Ort.: {product.marketAvg}</div>

            <div className="mt-3 rounded-xl bg-emerald-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-emerald-800">Güven Endeksi</span>
                <span className="text-sm font-bold text-emerald-800">{product.trustScore}</span>
              </div>

              <div className="mt-2 h-2 w-full rounded-full bg-emerald-100">
                <div
                  className="h-2 rounded-full bg-emerald-600"
                  style={{ width: `${Math.min(100, Math.max(0, product.trustScore))}%` }}
                />
              </div>

              <ul className="mt-3 space-y-1 text-xs text-emerald-900/80">
                <li className="flex items-center gap-2"><Check /> Satıcı güveni</li>
                <li className="flex items-center gap-2"><Check /> Fiyat istikrarı</li>
                <li className="flex items-center gap-2"><Check /> Teslimat geçmişi</li>
                <li className="flex items-center gap-2"><Warn /> İade oranı</li>
              </ul>
            </div>

            <a
              href={product.buyUrl}
              target="_blank"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-sm font-semibold text-white hover:bg-emerald-800"
            >
              Satın Al <ArrowRight />
            </a>
          </div>
        </div>

        {/* comparison row */}
        <div className="mt-5">
          <div className="text-sm font-semibold text-neutral-700">
            Aynı / Benzer Ürünlerde Güven & Fiyat Karşılaştırması
          </div>

          <div className="mt-3 grid grid-cols-3 gap-3">
            <MiniChoice
              title="Daha GÜVENLİ"
              price="3.675 TL"
              score="94/100"
              tone="green"
            />
            <MiniChoice
              title="Daha UCUZ"
              price="3.599 TL"
              score="76/100"
              tone="yellow"
            />
            <MiniChoice
              title="Riskli"
              price="3.520 TL"
              score="58/100"
              tone="red"
            />
          </div>

          <div className="mt-4 text-center text-xs text-neutral-400">+ yakında daha fazlası</div>
        </div>

        {/* bottom logos */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-neutral-500">
          <span className="font-semibold text-blue-700">Vatan</span>
          <span className="font-semibold text-orange-500">TEKNOSA</span>
          <span className="font-semibold text-red-600">MediaMarkt</span>
          <span className="font-semibold text-neutral-900">Trendyol</span>
          <span className="font-semibold text-pink-600">Pazarama</span>
        </div>
      </section>

      {/* soft waves */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-emerald-50 to-transparent" />
    </main>
  );
}

/* ---------------- Components ---------------- */

function MiniChoice({
  title,
  price,
  score,
  tone,
}: {
  title: string;
  price: string;
  score: string;
  tone: "green" | "yellow" | "red";
}) {
  const toneMap = {
    green: "border-emerald-200 bg-emerald-50 text-emerald-900",
    yellow: "border-yellow-200 bg-yellow-50 text-yellow-900",
    red: "border-red-200 bg-red-50 text-red-900",
  }[tone];

  const badgeMap = {
    green: "bg-emerald-700 text-white",
    yellow: "bg-yellow-500 text-white",
    red: "bg-red-600 text-white",
  }[tone];

  const btnMap = {
    green: "bg-emerald-700 hover:bg-emerald-800",
    yellow: "bg-yellow-400 hover:bg-yellow-500 text-neutral-900",
    red: "bg-red-600 hover:bg-red-700",
  }[tone];

  return (
    <div className={`rounded-2xl border p-2 shadow-[0_10px_30px_rgba(0,0,0,0.05)] ${toneMap}`}>
      <div className="text-[10px] font-semibold">{title} Seçenek</div>
      <div className="mt-1 flex items-center justify-between">
        <div className="text-xs font-semibold">{price}</div>
        <div className={`rounded-lg px-2 py-1 text-[10px] font-bold ${badgeMap}`}>{score}</div>
      </div>
      <div className="mt-2 h-12 rounded-xl bg-white/70" />
      <button className={`mt-2 w-full rounded-xl py-2 text-[10px] font-bold text-white ${btnMap}`}>
        SATIN AL
      </button>
    </div>
  );
}

function demoProduct(_id: string) {
  return {
    inputUrl: "https://bikonomi.com/…",
    title: "Apple AirPods (2. Nesil) MagSafe Şarj Kutulu Beyaz",
    bestPrice: "3.649 TL",
    marketAvg: "3.790 TL",
    trustScore: 82,
    buyUrl: "https://www.hepsiburada.com/",
  };
}

/* ---------- icons ---------- */

function BrandMark() {
  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600/10">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="text-emerald-600">
        <path
          d="M4 17.5V20h16v-2.5M6 16l4-5 3 3 5-7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

function Menu() {
  return (
    <details className="relative">
      <summary className="list-none cursor-pointer rounded-xl border border-neutral-200 p-2 hover:bg-neutral-50">
        <HamburgerIcon />
      </summary>
      <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
        <a className="block px-4 py-3 text-sm hover:bg-neutral-50" href="#">
          Hakkımızda
        </a>
        <a className="block px-4 py-3 text-sm hover:bg-neutral-50" href="#">
          Nasıl Çalışır?
        </a>
        <a className="block px-4 py-3 text-sm hover:bg-neutral-50" href="#">
          İletişim
        </a>
      </div>
    </details>
  );
}

function LinkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-neutral-500">
      <path
        d="M10 13a5 5 0 0 1 0-7l1-1a5 5 0 0 1 7 7l-1 1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 11a5 5 0 0 1 0 7l-1 1a5 5 0 0 1-7-7l1-1"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-white">
      <path d="M5 12h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-emerald-700">
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Warn() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-yellow-600">
      <path
        d="M12 9v4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 17h.01"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M10.3 4.4 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.4a2 2 0 0 0-3.4 0Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-neutral-700">
      <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function ProductImagePlaceholder() {
  return (
    <svg width="88" height="88" viewBox="0 0 120 120" fill="none">
      <rect x="22" y="18" width="76" height="76" rx="20" fill="#ffffff" stroke="#E5E7EB" />
      <rect x="36" y="36" width="48" height="44" rx="18" fill="#F3F4F6" />
      <circle cx="48" cy="46" r="6" fill="#D1D5DB" />
      <circle cx="72" cy="46" r="6" fill="#D1D5DB" />
      <rect x="46" y="54" width="28" height="28" rx="12" fill="#E5E7EB" />
    </svg>
  );
}
