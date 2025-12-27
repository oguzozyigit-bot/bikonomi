const mem = new Map<string, { v: any; exp: number }>();
const TTL_HOURS = Number(process.env.CACHE_TTL_HOURS || 6);

export async function getFromCache(key: string) {
  const hit = mem.get(key);
  if (!hit) return null;
  if (Date.now() > hit.exp) {
    mem.delete(key);
    return null;
  }
  return hit.v;
}

export async function setToCache(key: string, value: any) {
  mem.set(key, { v: value, exp: Date.now() + TTL_HOURS * 3600_000 });
}

export async function deleteFromCache(key: string) {
  mem.delete(key);
}
