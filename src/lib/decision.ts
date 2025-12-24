export type Decision = "ALINIR" | "DIKKAT" | "ALINMAZ";

export const DECISION_LABEL: Record<Decision, string> = {
  ALINIR: "ALINIR",
  DIKKAT: "DİKKAT",
  ALINMAZ: "ALINMAZ",
};

export const ALINMAZ_REASONS = [
  "Satıcı güveni düşük",
  "Fiyat ani düştü",
  "Sahte indirim ihtimali",
  "Stok / teslimat tutarsız",
] as const;

export function normalizeDecision(v: string | null | undefined): Decision {
  const x = (v || "").toUpperCase().trim();
  if (x === "ALINIR") return "ALINIR";
  if (x === "DIKKAT" || x === "DİKKAT") return "DIKKAT";
  if (x === "ALINMAZ") return "ALINMAZ";
  return "DIKKAT";
}

export function decisionHint(decision: Decision): string {
  switch (decision) {
    case "ALINIR":
      return "Fiyat ve güven dengeli. Gönül rahatlığıyla alınabilir.";
    case "DIKKAT":
      return "Ürün iyi görünüyor ama bazı riskler var. Karar senin.";
    case "ALINMAZ":
      return "Bu ürün Bikonomi standartlarını karşılamıyor. Satın alma kilitli.";
  }
}

export function priceTrustMessage(decision: Decision): string {
  switch (decision) {
    case "ALINIR":
      return "Bu fiyat güvenle örtüşüyor ✅";
    case "DIKKAT":
      return "Fiyat iyi görünüyor ama risk var ⚠️";
    case "ALINMAZ":
      return "Bu fiyat düşük görünüyor ama güven zayıf ❌";
  }
}
