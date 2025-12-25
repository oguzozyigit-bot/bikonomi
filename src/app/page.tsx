"use client";

import { useMemo, useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");

  const goHref = useMemo(() => {
    const trimmed = url.trim();
    if (!trimmed) return "/p/demo";
    return `/p/demo?url=${encodeURIComponent(trimmed)}`;
  }, [url]);

  return (
    <main className="min-h-screen bg-white text-neutral-900">
      <header className="mx-auto flex max-w-md items-center justify-between px-5 pt-6">
        <div className="flex items-center gap-2">
          <BrandMark />
          <span className="text-lg font-semibold tracking-tight">Bikonomi</span>
        </div>
        <Menu />
      </header>

      <section className="mx-auto flex max-w-md flex-col items-center px-5 pt-10">
        <div className="w-full">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-3xl font-semibold tracking-tight">Satın almadan önce</h1>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">son kontrol.</h2>
            <p className="mt-3 text-sm text-neutral-500">
              Daha ucuzu ya da daha güvenlisi var mı, 5 saniyede gör.
            </p>
          </div>

          <div className="mt-7 w-full rounded-2xl border border-neutral-200 bg-white p-3 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-3">
              <LinkIcon />
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400"
                placeholder="Ürün linkini buraya yapıştır"
                inputMode="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <a
              href={goHref}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(16,185,129,0.25)] hover:bg-emerald-700"
            >
              Kontrol Et <ArrowRight />
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs text-neutral-500">
            <span className="font-semibold text-orange-600">Hepsiburada</span>
            <span className="font-semibold text-neutral-900">amazon</span>
            <span className="font-semibold text-blue-700">Vatan</span>
            <span className="font-semibold text-orange-500">TEKNOSA</span>
            <span className="font-semibold text-red-600">MediaMarkt</span>
            <span className="font-semibold text-neutral-700">n11</span>
            <span className="font-semibold text-emerald-600">ÇiçekSepeti</span>
            <span className="font-semibold text-pink-600">Pazarama</span>
            <span className="text-neutral-400">+ yakında daha fazlası</span>
          </div>

          <div className="mt-10 flex items-center justify-center gap-2 text-sm text-emerald-700">
            <ShieldIcon />
            <span>Satın almaya yönlendirilirsiniz, satış yapılmaz.</span>
          </div>
        </div>
      </section>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-emerald-50 to-transparent" />
    </main>
  );
}

/* ------- UI bits ------- */

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

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-emerald-600">
      <path
        d="M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 12l2.2 2.2 4.8-4.8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
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
