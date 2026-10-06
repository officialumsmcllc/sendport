import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { logSecurityAudit } from "@/lib/security/audit";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
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
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
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
      const updated = await prisma.paymentTransaction.update({
        where: { id: tx.id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          adminNotes: adminNotes || "Payment verified by administrator.",
        },
      });

      // Automatically upgrade workspace daily quota based on plan
      const quota = tx.plan === "SCALE_PRO" ? 25000 : tx.plan === "GROWTH" ? 5000 : 500;
      await prisma.workspace.updateMany({
        data: {
          plan: tx.plan,
          dailyQuota: quota,
        },
      });

      logSecurityAudit("PAYMENT_APPROVED", tx.userId, {
        transactionId: tx.id,
        plan: tx.plan,
        newQuota: quota,
      });

      return NextResponse.json({
        success: true,
        message: `Transaction approved! Workspace upgraded to ${tx.plan} (${quota.toLocaleString()} emails/day).`,
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
