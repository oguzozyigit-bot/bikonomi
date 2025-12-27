function q(s: string) {
  return encodeURIComponent((s || "").trim().slice(0, 120));
}

export function buildSearchLinks(title: string) {
  const query = q(title || "ürün");

  return [
    { store: "Trendyol", url: `https://www.trendyol.com/sr?q=${query}` },
    { store: "Hepsiburada", url: `https://www.hepsiburada.com/ara?q=${query}` },
    { store: "Amazon", url: `https://www.amazon.com.tr/s?k=${query}` },
  ];
}
