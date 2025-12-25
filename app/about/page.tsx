import Link from "next/link";

export default function AboutPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <Link href="/" style={{ opacity: 0.8, textDecoration: "none" }}>← Ana sayfa</Link>

      <h1 style={{ fontSize: 28, fontWeight: 950, margin: "12px 0 0" }}>Hakkımızda</h1>

      <p style={{ marginTop: 10, opacity: 0.9, lineHeight: 1.6 }}>
        <b>Bikonomi</b>, fiyat karşılaştırmanın ötesine geçen; ürünlerin fiyat davranışını, piyasa hareketini ve kullanıcı
        ilgisini tek ekranda gösteren yeni nesil bir platformdur.
      </p>

      <section style={{ border: "1px solid #eee", borderRadius: 16, padding: 14, marginTop: 14 }}>
        <div style={{ fontWeight: 900 }}>Misyon</div>
        <div style={{ marginTop: 6, opacity: 0.9 }}>
          Kullanıcının cebini korumak için fiyatı “rakam” olmaktan çıkarıp anlaşılır bir veriye dönüştürmek.
        </div>
      </section>

      <section style={{ border: "1px solid #eee", borderRadius: 16, padding: 14, marginTop: 12 }}>
        <div style={{ fontWeight: 900 }}>Vizyon</div>
        <div style={{ marginTop: 6, opacity: 0.9 }}>
          Fiyat hareketleriyle ekonomiyi aynı bağlamda okutan, şeffaf ve güvenilir bir alışveriş/ekonomi ekranı olmak.
        </div>
      </section>
    </main>
  );
}
