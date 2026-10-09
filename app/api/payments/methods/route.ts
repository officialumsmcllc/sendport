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
        "isActive" BOOLEAN NOT NULL DEFAULT true,
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

    // Fallback if none in database yet
    if (methods.length === 0) {
      methods = [
        {
          id: "def-1",
          code: "EASYPAISA",
          name: "Easypaisa Mobile Wallet",
          accountTitle: "Muhammad Umar",
          accountNumber: "0300-1234567",
          instructions: "Transfer exact PKR amount via Easypaisa App or *786#. Paste Transaction ID / TID below.",
          qrCodeUrl: null,
          currency: "PKR",
        },
        {
          id: "def-2",
          code: "JAZZCASH",
          name: "JazzCash Mobile Account",
          accountTitle: "Muhammad Umar",
          accountNumber: "0300-7654321",
          instructions: "Send via JazzCash App or USSD *786#. Enter the 12-digit TID in the form.",
          qrCodeUrl: null,
          currency: "PKR",
        },
        {
          id: "def-3",
          code: "RAAST",
          name: "Raast Instant IBAN (0% Fee)",
          accountTitle: "Sendport Technologies",
          accountNumber: "PK00MEZN00012345678901",
          instructions: "Use Raast Instant Payment from any Pakistani bank app without any transfer fees.",
          qrCodeUrl: null,
          currency: "PKR",
        },
        {
          id: "def-4",
          code: "USDT_TRC20",
          name: "Binance / Crypto USDT (TRC-20)",
          accountTitle: "Official TRC20 Treasury",
          accountNumber: "TXYZ9876543210AbCdEfGhIjKlMnOpQrStUv",
          instructions: "Send only TRC-20 USDT. Minimum equivalent amount. Enter your 64-character TxHash.",
          qrCodeUrl: null,
          currency: "USD",
        },
        {
          id: "def-5",
          code: "BANK_TRANSFER",
          name: "Meezan Bank Ltd (Direct Wire)",
          accountTitle: "Official UM1 LLC",
          accountNumber: "01020304050607 / IBAN: PK92MEZN0001020304050607",
          instructions: "Transfer to Meezan Bank. Please attach transaction screenshot or enter Reference number.",
          qrCodeUrl: null,
          currency: "PKR",
        },
        {
          id: "def-6",
          code: "SADAPAY",
          name: "SadaPay Personal / Business",
          accountTitle: "Muhammad Umar",
          accountNumber: "0300-1234567 / IBAN: PK00SADA...",
          instructions: "Send via SadaPay App or IBAN transfer. Enter the SadaPay transaction ID in the field.",
          qrCodeUrl: null,
          currency: "PKR",
        },
        {
          id: "def-7",
          code: "NAYAPAY",
          name: "NayaPay Digital Wallet",
          accountTitle: "Muhammad Umar",
          accountNumber: "0300-1234567 / @nayapay_id",
          instructions: "Transfer to NayaPay wallet or IBAN. Enter your NayaPay Reference ID below.",
          qrCodeUrl: null,
          currency: "PKR",
        },
        {
          id: "def-8",
          code: "WISE_PAYONEER",
          name: "Wise / Payoneer Transfer (USD/EUR/GBP)",
          accountTitle: "Official UM1 LLC",
          accountNumber: "billing@sendport.io / Wise Account",
          instructions: "Transfer via Wise or Payoneer directly. Enter Wise transfer reference number.",
          qrCodeUrl: null,
          currency: "USD",
        },
      ];
    }

    return NextResponse.json({ methods });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
