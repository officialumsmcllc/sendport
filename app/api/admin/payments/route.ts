// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";
import { activatePaymentOrder } from "@/lib/payments/activation";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const transactions = await prisma.paymentTransaction.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: true },
    });
    return NextResponse.json({ transactions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { transactionId, action, adminNotes } = body; // action: "APPROVE" | "REJECT"

    const tx = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: { user: true },
    });

    if (!tx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (action === "APPROVE") {
      const result = await activatePaymentOrder(tx.id, adminNotes || "Payment verified by administrator.");
      if (!result.success) {
        return NextResponse.json({ error: result.error || "Failed to activate order." }, { status: 500 });
      }

      const updated = await prisma.paymentTransaction.findUnique({
        where: { id: tx.id },
      });

      const successMsg = tx.isCreditTopup && tx.creditsPurchased
        ? `Transaction approved! Added ${tx.creditsPurchased.toLocaleString()} non-expiring credits to workspace.`
        : `Transaction approved! Workspace upgraded to ${tx.plan}.`;

      return NextResponse.json({
        success: true,
        message: successMsg,
        transaction: updated,
      });
    } else {
      const updated = await prisma.paymentTransaction.update({
        where: { id: tx.id },
        data: {
          status: "REJECTED",
          adminNotes: adminNotes || "Invalid reference number or receipt not found.",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Transaction rejected.",
        transaction: updated,
      });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
