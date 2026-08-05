import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
// Validate required environment variables on startup
import "@/lib/env";


// Resolve the absolute path of the SQLite dev.db file
const dbPath = path.resolve(process.cwd(), "dev.db");

// In Prisma 7, PrismaBetterSqlite3 takes configuration options directly
const adapter = new PrismaBetterSqlite3({ url: dbPath });

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
