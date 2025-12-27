export type Source = "trendyol" | "hepsiburada" | "amazon" | "unknown";

export function normalizeUrl(raw: string): { source: Source; clean: string } {
  let u = (raw || "").trim();
  if (!u) return { source: "unknown", clean: "" };

  if (!/^https?:\/\//i.test(u)) {
    u = "https://" + u;
  }

  try {
    const url = new URL(u);
    const host = url.hostname.replace(/^www\./, "");

    let source: Source = "unknown";
    if (host.includes("trendyol")) source = "trendyol";
    else if (host.includes("hepsiburada")) source = "hepsiburada";
    else if (host.includes("amazon")) source = "amazon";

    // 🔓 MVP için gevşek bırakıyoruz
    return { source, clean: url.toString() };
  } catch {
    // ❗ MVP KURALI:
    // Parse edemezsek bile linki olduğu gibi kabul et
    return { source: "unknown", clean: u };
  }
}
