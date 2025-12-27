// src/lib/db.ts
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __bikonomiPool: Pool | undefined;
}

function getPool() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL missing");

  // Serverless/Next için global singleton
  if (!global.__bikonomiPool) {
    global.__bikonomiPool = new Pool({
      connectionString: url,
      ssl: url.includes("sslmode=require") ? { rejectUnauthorized: false } : undefined,
      max: 5,
    });
  }
  return global.__bikonomiPool;
}

export async function dbQuery<T = any>(text: string, params: any[] = []) {
  const pool = getPool();
  const res = await pool.query(text, params);
  return res as { rows: T[] };
}
