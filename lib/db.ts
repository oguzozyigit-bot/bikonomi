// lib/db.ts
/* MVP-0: Prisma opsiyonel. Prod deploy'da Prisma yoksa build düşmesin. */

export type DbClient = any;

declare global {
  // eslint-disable-next-line no-var
  var prisma: DbClient | undefined;
}

let prisma: DbClient = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { PrismaClient } = require("@prisma/client");

  const globalForPrisma = globalThis as unknown as { prisma?: DbClient };
  prisma = globalForPrisma.prisma ?? new PrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }
} catch {
  // Prisma kurulu değilse / generate değilse MVP-0'da sorun değil
  prisma = null;
}

export { prisma };
export default prisma;

