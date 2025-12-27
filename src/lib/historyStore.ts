type Point = { date: string; price: number };

// 🔥 DEV MEMORY STORE
const memory: Record<string, Point[]> = {};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function appendPrice(productKey: string, price: number) {
  const list = memory[productKey] || [];
  const d = todayISO();

  const idx = list.findIndex((p) => p.date === d);
  if (idx >= 0) list[idx] = { date: d, price };
  else list.push({ date: d, price });

  memory[productKey] = list.slice(-60);
  return memory[productKey];
}

export function getHistory(productKey: string) {
  return memory[productKey] || [];
}
