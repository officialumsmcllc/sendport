// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { createCryptomusInvoice } from "@/lib/payments/cryptomus";

const CREDIT_PACK_PRICES: Record<string, { credits: number; usdPrice: number }> = {
  PACK_10K: { credits: 10000, usdPrice: 5 },
  PACK_50K: { credits: 50000, usdPrice: 15 },
  PACK_200K: { credits: 200000, usdPrice: 45 },
};

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser(req);
    if (!session?.userId) {
      return NextResponse.json({ error: "Authentication required to initiate payment." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { plan, creditPackId } = body;

    let amount = 0;
    let targetPlan = "STARTER";
    let isCreditTopup = false;
    let creditsPurchased = 0;

    if (creditPackId) {
      const pack = CREDIT_PACK_PRICES[creditPackId];
      if (!pack) {
        return NextResponse.json({ error: "Invalid credit pack selected." }, { status: 400 });
      }
      amount = pack.usdPrice;
      isCreditTopup = true;
      creditsPurchased = pack.credits;
    } else if (plan === "GROWTH") {
      amount = 20;
      targetPlan = "GROWTH";
    } else if (plan === "SCALE_PRO") {
      amount = 79;
      targetPlan = "SCALE_PRO";
    } else {
      return NextResponse.json({ error: "Please select a valid plan (GROWTH, SCALE_PRO) or credit pack." }, { status: 400 });
    }

    // 1. Create Pending Payment Transaction in Database
    const tx = await prisma.paymentTransaction.create({
      data: {
        userId: session.userId,
        plan: targetPlan,
        amount,
        currency: "USD",
        method: "CRYPTOMUS",
        status: "PENDING",
        isCreditTopup,
        creditsPurchased: isCreditTopup ? creditsPurchased : null,
        senderName: session.name || session.email.split("@")[0],
      },
    });

    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://getsendport.com").replace(/\/$/, "");
    const callbackUrl = `${appUrl}/api/payments/cryptomus/webhook`;
    const returnUrl = `${appUrl}/dashboard/billing?payment=completed&txId=${tx.id}`;

    // 2. Generate Cryptomus Invoice
    const invoiceResult = await createCryptomusInvoice({
      orderId: tx.id,
      amount: amount.toFixed(2),
      currency: "USD",
      returnUrl,
      callbackUrl,
    });

    if (!invoiceResult.success || !invoiceResult.paymentUrl) {
      // Clean up failed pending transaction
      await prisma.paymentTransaction.delete({ where: { id: tx.id } }).catch(() => {});
      return NextResponse.json(
        { error: invoiceResult.error || "Failed to initialize Cryptomus payment." },
        { status: 502 }
      );
    }

    // 3. Update Transaction with Cryptomus Invoice Reference
    await prisma.paymentTransaction.update({
      where: { id: tx.id },
      data: {
        referenceId: invoiceResult.uuid || tx.id,
        receiptUrl: invoiceResult.paymentUrl,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: tx.id,
      paymentUrl: invoiceResult.paymentUrl,
      amount: amount.toFixed(2),
      currency: "USD",
      isMock: invoiceResult.isMock || false,
    });
  } catch (error: any) {
    console.error("[CRYPTOMUS_CREATE_ERR]:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

