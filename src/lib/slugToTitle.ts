// src/lib/slugToTitle.ts
type SlugToTitleOptions = {
  maxWords?: number;
  keepNumbers?: boolean; // "128gb" gibi şeyleri koru
};

const STOP = new Set([
  "p", "pr", "product", "products", "urun", "ürün", "item", "items",
  "id", "sku", "ref", "code", "kod", "no", "num",
  "html", "htm", "php", "aspx",
  "tr", "turkiye", "turkey",
]);

// Slug içinde sık görülen marka/model düzeltmeleri
const PHRASE_FIXES: Array<[RegExp, string]> = [
  [/\biphone\b/gi, "iPhone"],
  [/\bipad\b/gi, "iPad"],
  [/\bmacbook\b/gi, "MacBook"],
  [/\bps5\b/gi, "PS5"],
  [/\bps4\b/gi, "PS4"],
  [/\bs(\d{2})\s*ultra\b/gi, "S$1 Ultra"],
  [/\bgalaxy\s*s(\d{2})\b/gi, "Galaxy S$1"],
];

const WORD_FIXES: Record<string, string> = {
  "gb": "GB",
  "tb": "TB",
  "ssd": "SSD",
  "hdd": "HDD",
  "ram": "RAM",
  "oled": "OLED",
  "qled": "QLED",
  "uhd": "UHD",
  "4k": "4K",
  "8k": "8K",
  "wi-fi": "Wi-Fi",
  "wifi": "Wi-Fi",
  "bluetooth": "Bluetooth",
  "type-c": "Type-C",
  "typec": "Type-C",
};

function safeDecode(input: string) {
  try {
    return decodeURIComponent(input);
  } catch {
    return input;
  }
}

function normalizeSeparators(s: string) {
  // plus'ı space gibi say
  return s.replace(/\+/g, " ").replace(/[_\-]+/g, " ");
}

function stripFileLike(s: string) {
  return s.replace(/\.(html?|php|aspx)$/i, "");
}

function cleanupSymbols(s: string) {
  // aşırı noktalama/emoji vs
  return s
    .replace(/[|()[\]{}<>"]/g, " ")
    .replace(/[’'`´]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// "samsung-galaxy-s23-ultra-256gb" -> ["samsung","galaxy","s23","ultra","256gb"]
function tokenize(s: string) {
  return s.split(" ").map(x => x.trim()).filter(Boolean);
}

function looksLikeIdToken(t: string) {
  // 8+ haneli sayısal veya karışık uzun token’lar genelde id
  if (/^\d{8,}$/.test(t)) return true;
  if (/^[a-z0-9]{12,}$/i.test(t) && /\d/.test(t) && /[a-z]/i.test(t)) return true;
  return false;
}

function titleCaseWord(w: string) {
  const low = w.toLowerCase();

  if (WORD_FIXES[low]) return WORD_FIXES[low];

  // tamamen sayı veya 4K gibi: büyük harf dokunma
  if (/^\d+([.,]\d+)?$/.test(w)) return w;

  // "256gb" -> "256GB"
  const m = low.match(/^(\d+)\s*(gb|tb)$/);
  if (m) return `${m[1]}${m[2].toUpperCase()}`;

  // normal kelime
  return low.charAt(0).toUpperCase() + low.slice(1);
}

export function slugToTitle(slugRaw: string, opts: SlugToTitleOptions = {}) {
  const { maxWords = 10, keepNumbers = true } = opts;

  let s = (slugRaw || "").trim();
  if (!s) return "";

  s = safeDecode(s);
  s = stripFileLike(s);
  s = normalizeSeparators(s);
  s = cleanupSymbols(s);

  // phrase fixes (string üzerinde)
  for (const [re, rep] of PHRASE_FIXES) {
    s = s.replace(re, rep);
  }

  const tokens = tokenize(s);

  const filtered = tokens.filter((t) => {
    const low = t.toLowerCase();

    if (STOP.has(low)) return false;
    if (looksLikeIdToken(t)) return false;

    // tek harf vb.
    if (t.length <= 1) return false;

    // sayıları tamamen atmak istersen
    if (!keepNumbers && /^\d+$/.test(t)) return false;

    return true;
  });

  const limited = filtered.slice(0, maxWords);

  const titled = limited.map(titleCaseWord).join(" ");

  // küçük son rötuş: çift boşluk vs
  return titled.replace(/\s+/g, " ").trim();
}

/**
 * URL’den slug üretmek için mini helper:
 * - /p/xxx gibi path'lerden son segment
 * - query param "u" içinden de çekmek isteyen olursa diye ayrı bırakıyoruz
 */
export function extractSlugFromPath(pathname: string) {
  const parts = (pathname || "").split("/").filter(Boolean);
  return parts[parts.length - 1] || "";
}
