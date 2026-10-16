import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { logSecurityAudit } from "@/lib/security/audit";
import { getAuthContext } from "@/lib/auth/workspace-auth";

/**
 * POST /api/payments/manual
 * User submits proof (Transaction ID / TxHash / Slip)
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
    }

    const body = await req.json();
    const { plan, amount, currency, method, referenceId, senderName, senderPhone, receiptUrl, isCreditTopup, creditsPurchased } = body;

    const transaction = await prisma.paymentTransaction.create({
      data: {
        userId: auth.user.id,
        plan: plan || (isCreditTopup ? "CREDIT_TOPUP" : "GROWTH"),
        amount: parseFloat(amount) || 20,
        currency: currency || "USD",
        method: method || "BANK_TRANSFER",
        referenceId: referenceId || "TX-" + Date.now(),
        senderName: senderName || auth.user.name || "Customer",
        senderPhone: senderPhone || null,
        receiptUrl: receiptUrl || null,
        isCreditTopup: Boolean(isCreditTopup),
        creditsPurchased: creditsPurchased ? parseInt(creditsPurchased, 10) : null,
        status: "PENDING",
      },
    });

    logSecurityAudit("PAYMENT_SUBMITTED", auth.user.id, {
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
