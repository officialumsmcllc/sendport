import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

async function ensurePaymentMethodTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "PaymentMethodConfig" (
        "id" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "accountTitle" TEXT NOT NULL,
        "accountNumber" TEXT NOT NULL,
        "instructions" TEXT,
        "qrCodeUrl" TEXT,
        "currency" TEXT NOT NULL DEFAULT 'PKR',
        "isActive" BOOLEAN NOT NULL DEFAULT false,
        "displayOrder" INTEGER NOT NULL DEFAULT 0,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "PaymentMethodConfig_pkey" PRIMARY KEY ("id")
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE UNIQUE INDEX IF NOT EXISTS "PaymentMethodConfig_code_key" ON "PaymentMethodConfig"("code");
    `);
  } catch (err) {
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "PaymentMethodConfig" (
          id TEXT PRIMARY KEY,
          code TEXT UNIQUE,
          name TEXT,
          accountTitle TEXT,
          accountNumber TEXT,
          instructions TEXT,
          qrCodeUrl TEXT,
          currency TEXT DEFAULT 'PKR',
          isActive BOOLEAN DEFAULT 1,
          displayOrder INTEGER DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (e2) {}
  }
}

export async function GET(req: NextRequest) {
  try {
    await ensurePaymentMethodTable();

    let methods = await prisma.paymentMethodConfig.findMany({
      where: { isActive: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        code: true,
        name: true,
        accountTitle: true,
        accountNumber: true,
        instructions: true,
        qrCodeUrl: true,
        currency: true,
      },
    });

    // Only active manual methods are returned (if none active, customer checkout only routes via Cryptomus)
    return NextResponse.json({ methods: methods || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
