// src/app/api/og/route.ts
export async function GET() {
  // Şimdilik OG için sabit görsel yönlendirme
  // (JSX yok, ImageResponse yok, parser hatası yok)

  return new Response(null, {
    status: 302,
    headers: {
      Location: "/og.png",
    },
  });
}
