import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { logSecurityAudit } from "@/lib/security/audit";

const DEFAULT_METHODS = [
  {
    code: "EASYPAISA",
    name: "Easypaisa Mobile Wallet",
    accountTitle: "Muhammad Umar",
    accountNumber: "0300-1234567",
    currency: "PKR",
    instructions: "Transfer exact PKR amount via Easypaisa App or *786#. Paste Transaction ID / TID below.",
    displayOrder: 1,
    isActive: true,
  },
  {
    code: "JAZZCASH",
    name: "JazzCash Mobile Account",
    accountTitle: "Muhammad Umar",
    accountNumber: "0300-7654321",
    currency: "PKR",
    instructions: "Send via JazzCash App or USSD *786#. Enter the 12-digit TID in the form.",
    displayOrder: 2,
    isActive: true,
  },
  {
    code: "RAAST",
    name: "Raast Instant IBAN (0% Fee)",
    accountTitle: "Sendport Technologies",
    accountNumber: "PK00MEZN00012345678901",
    currency: "PKR",
    instructions: "Use Raast Instant Payment from any Pakistani bank app without any transfer fees.",
    displayOrder: 3,
    isActive: true,
  },
  {
    code: "BANK_TRANSFER",
    name: "Meezan Bank Ltd (Direct Wire)",
    accountTitle: "Official UM1 LLC",
    accountNumber: "01020304050607 / IBAN: PK92MEZN0001020304050607",
    currency: "PKR",
    instructions: "Transfer to Meezan Bank. Please attach transaction screenshot or enter Reference number.",
    displayOrder: 4,
    isActive: true,
  },
  {
    code: "USDT_TRC20",
    name: "Binance / Crypto USDT (TRC-20)",
    accountTitle: "Official TRC20 Treasury",
    accountNumber: "TXYZ9876543210AbCdEfGhIjKlMnOpQrStUv",
    currency: "USD",
    instructions: "Send only TRC-20 USDT. Minimum equivalent amount. Enter your 64-character TxHash.",
    displayOrder: 5,
    isActive: true,
  },
];

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    let methods = await prisma.paymentMethodConfig.findMany({
      orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    });

    // Seed defaults if empty
    if (methods.length === 0) {
      for (const def of DEFAULT_METHODS) {
        await prisma.paymentMethodConfig.create({
          data: def,
        });
      }
      methods = await prisma.paymentMethodConfig.findMany({
        orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
      });
    }

    return NextResponse.json({ methods });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { code, name, accountTitle, accountNumber, instructions, currency, isActive, displayOrder } = body;

    if (!code || !name || !accountTitle || !accountNumber) {
      return NextResponse.json(
        { error: "Code, Name, Account Title, and Account Number are required." },
        { status: 422 }
      );
    }

    const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");

    const existing = await prisma.paymentMethodConfig.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Payment method code '${cleanCode}' already exists.` },
        { status: 409 }
      );
    }

    const method = await prisma.paymentMethodConfig.create({
      data: {
        code: cleanCode,
        name: name.trim(),
        accountTitle: accountTitle.trim(),
        accountNumber: accountNumber.trim(),
        instructions: instructions ? instructions.trim() : null,
        currency: currency ? currency.trim().toUpperCase() : "PKR",
        isActive: isActive !== false,
        displayOrder: Number(displayOrder) || 0,
      },
    });

    logSecurityAudit("PAYMENT_METHOD_CREATED", session.userId, {
      code: method.code,
      name: method.name,
    });

    return NextResponse.json({
      success: true,
      message: `Payment method '${method.name}' created successfully!`,
      method,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, name, accountTitle, accountNumber, instructions, currency, isActive, displayOrder } = body;

    if (!id) {
      return NextResponse.json({ error: "Method ID is required." }, { status: 400 });
    }

    const updated = await prisma.paymentMethodConfig.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(accountTitle !== undefined && { accountTitle: accountTitle.trim() }),
        ...(accountNumber !== undefined && { accountNumber: accountNumber.trim() }),
        ...(instructions !== undefined && { instructions: instructions ? instructions.trim() : null }),
        ...(currency !== undefined && { currency: currency.trim().toUpperCase() }),
        ...(isActive !== undefined && { isActive: Boolean(isActive) }),
        ...(displayOrder !== undefined && { displayOrder: Number(displayOrder) }),
      },
    });

    logSecurityAudit("PAYMENT_METHOD_UPDATED", session.userId, {
      id: updated.id,
      code: updated.code,
      isActive: updated.isActive,
    });

    return NextResponse.json({
      success: true,
      message: `Payment method '${updated.name}' updated successfully!`,
      method: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Method ID is required." }, { status: 400 });
    }

    const deleted = await prisma.paymentMethodConfig.delete({
      where: { id },
    });

    logSecurityAudit("PAYMENT_METHOD_DELETED", session.userId, {
      code: deleted.code,
    });

    return NextResponse.json({
      success: true,
      message: `Payment method '${deleted.name}' deleted successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
