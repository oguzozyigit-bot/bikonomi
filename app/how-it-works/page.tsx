import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <Link href="/" style={{ opacity: 0.8, textDecoration: "none" }}>← Ana sayfa</Link>

      <h1 style={{ fontSize: 28, fontWeight: 950, margin: "12px 0 0" }}>Nasıl Çalışır?</h1>

      <p style={{ marginTop: 10, opacity: 0.9, lineHeight: 1.6 }}>
        Bikonomi, fiyatı sadece göstermeyi değil; <b>fiyat hareketini</b> ve <b>bağlamını</b> anlatmayı hedefler.
        “Al/Alma” demez, veriyi sadeleştirir.
      </p>

      <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
        <section style={{ border: "1px solid #eee", borderRadius: 16, padding: 14 }}>
          <div style={{ fontWeight: 900 }}>1) Fiyatı Artanlar / Düşenler</div>
          <div style={{ marginTop: 6, opacity: 0.9 }}>
            Son 24 saatte yükselen ve düşen ürünleri ayrı listeler. Bugün/Dün/Değişim net görünür.
          </div>
        </section>

        <section style={{ border: "1px solid #eee", borderRadius: 16, padding: 14 }}>
          <div style={{ fontWeight: 900 }}>2) Bikonomi Yorumu</div>
          <div style={{ marginTop: 6, opacity: 0.9 }}>
            Fiyat değişimini kısa, nötr ve veriye dayalı şekilde açıklar.
          </div>
        </section>

        <section style={{ border: "1px solid #eee", borderRadius: 16, padding: 14 }}>
          <div style={{ fontWeight: 900 }}>3) Popüler Ürünler</div>
          <div style={{ marginTop: 6, opacity: 0.9 }}>
            En çok görüntülenen ürünleri öne çıkarır. Böylece “insanlar neye bakıyor?” görünür.
          </div>
        </section>
      </div>
    </main>
  );
}
