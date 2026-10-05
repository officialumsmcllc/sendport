import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { logSecurityAudit } from "@/lib/security/audit";

/**
 * POST /api/payments/manual
 * User submits proof (Transaction ID / TxHash / Slip)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { plan, amount, currency, method, referenceId, senderName, senderPhone, receiptUrl } = body;

    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { email: "user@getsendport.com", name: "Valued Customer" },
      });
    }

    const transaction = await prisma.paymentTransaction.create({
      data: {
        userId: user.id,
        plan: plan || "GROWTH",
        amount: parseFloat(amount) || 29,
        currency: currency || "USD",
        method: method || "BANK_TRANSFER",
        referenceId: referenceId || "TX-" + Date.now(),
        senderName: senderName || "Customer",
        senderPhone: senderPhone || null,
        receiptUrl: receiptUrl || null,
        status: "PENDING",
      },
    });

    logSecurityAudit("PAYMENT_SUBMITTED", user.id, {
      transactionId: transaction.id,
      plan: transaction.plan,
      method: transaction.method,
    });

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      status: "PENDING",
      message: "Payment proof submitted successfully! Your account will be upgraded within 15 minutes upon verification.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
