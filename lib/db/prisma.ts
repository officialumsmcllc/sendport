import { PrismaClient } from "@prisma/client";

// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// Database Engine: High-Performance Render Managed Postgres
// ==============================================================

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

