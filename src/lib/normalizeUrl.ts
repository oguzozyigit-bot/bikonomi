export function normalizeUrl(raw: string) {
  const u = raw.trim();
  if (!u) throw new Error("empty");

  const url = new URL(u.startsWith("http") ? u : `https://${u}`);
  url.protocol = "https:";
  url.hostname = url.hostname.replace(/^www\./, "");

  // tracking temizliği
  [...url.searchParams.keys()].forEach((k) => {
    if (
      k.startsWith("utm_") ||
      ["gclid", "fbclid", "ref", "tag", "ie", "psc", "spm", "wt_mc"].includes(k)
    ) {
      url.searchParams.delete(k);
    }
  });

  const host = url.hostname;
  let source: "Trendyol" | "Hepsiburada" | "Amazon" | "Other" = "Other";
  let pathCore = url.pathname;

  if (host.includes("trendyol")) {
    source = "Trendyol";
  } else if (host.includes("hepsiburada")) {
    source = "Hepsiburada";
  } else if (host.includes("amazon")) {
    source = "Amazon";
    const m = url.pathname.match(/\/(dp|gp\/product)\/([A-Z0-9]{8,10})/);
    if (m) pathCore = `/dp/${m[2]}`;
  }

  const productKey = `${source.toLowerCase()}:${host}:${pathCore.replace(/\/+$/, "")}`;

  return { productKey, source, cleanUrl: url.toString() };
}
