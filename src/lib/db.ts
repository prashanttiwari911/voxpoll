import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "@/lib/env";

const connectionString = process.env.DATABASE_URL;

// Configure pool to handle serverless cold starts gracefully
const pool = new Pool({ 
  connectionString,
  connectionTimeoutMillis: 10000,
  ssl: { rejectUnauthorized: false }
});

const adapter = new PrismaPg(pool);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const baseClient = globalForPrisma.prisma || new PrismaClient({ adapter });

export const db = baseClient.$extends({
  query: {
    poll: {
      async $allOperations({ operation, args, query }) {
        if (operation === 'delete') {
          return baseClient.poll.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        }
        if (operation === 'deleteMany') {
          return baseClient.poll.updateMany({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        }
        if (['findUnique', 'findFirst', 'findMany', 'count'].includes(operation)) {
          (args as any).where = { ...(args as any).where, deletedAt: null };
        }
        return query(args);
      },
    },
    user: {
      async $allOperations({ operation, args, query }) {
        if (operation === 'delete') {
          return baseClient.user.update({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        }
        if (operation === 'deleteMany') {
          return baseClient.user.updateMany({
            where: args.where,
            data: { deletedAt: new Date() },
          });
        }
        if (['findUnique', 'findFirst', 'findMany', 'count'].includes(operation)) {
          (args as any).where = { ...(args as any).where, deletedAt: null };
        }
        return query(args);
      },
    }
  }
}) as unknown as PrismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = baseClient;
