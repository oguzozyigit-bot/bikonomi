export default function AlternativesPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow p-4 sm:p-6">
        <div className="text-2xl font-semibold text-slate-900">Alternatifler</div>
        <div className="mt-2 text-slate-600">
          (MVP) Buraya benzer/aynı ürün alternatifleri gelecek.
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 p-4 text-sm text-slate-700">
          Şimdilik: “Aynı ürün / benzer ürün” kartlarını burada göstereceğiz ve her kartta
          <b> Güven Endeksi</b> + <b>Satın Al</b> olacak.
        </div>

        <a
          href="/"
          className="mt-4 block text-center h-12 leading-[48px] rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800"
        >
          Ana Sayfaya Dön
        </a>
      </div>
    </main>
  );
}
