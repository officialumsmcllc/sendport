import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { logSecurityAudit } from "@/lib/security/audit";
import { getCurrentUser } from "@/lib/auth/session";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";

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
      const updated = await prisma.paymentTransaction.update({
        where: { id: tx.id },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          adminNotes: adminNotes || "Payment verified by administrator.",
        },
      });

      const userWorkspaces = await prisma.workspaceMember.findMany({
        where: { userId: tx.userId },
      });

      const quota = tx.plan === "SCALE_PRO" ? 25000 : tx.plan === "GROWTH" ? 3000 : 100;

      if (tx.isCreditTopup && tx.creditsPurchased) {
        // Automatically add top-up credits to user's workspaces
        for (const wm of userWorkspaces) {
          await prisma.workspace.update({
            where: { id: wm.workspaceId },
            data: {
              credits: { increment: tx.creditsPurchased },
            },
          });
        }
      } else {
        // Automatically upgrade user's workspace daily quota based on plan
        for (const wm of userWorkspaces) {
          await prisma.workspace.update({
            where: { id: wm.workspaceId },
            data: {
              plan: tx.plan,
              dailyQuota: quota,
            },
          });
        }
      }

      logSecurityAudit("PAYMENT_APPROVED", tx.userId, {
        transactionId: tx.id,
        plan: tx.plan,
        isCreditTopup: tx.isCreditTopup,
        creditsPurchased: tx.creditsPurchased,
      });

      // Send Plan Upgrade Confirmation Email from no-reply@getsendport.com
      prisma.user.findUnique({ where: { id: tx.userId }, select: { email: true, name: true } })
        .then((user) => {
          if (user?.email) {
            import("@/lib/email/system-mailer")
              .then(({ sendPlanUpgradeEmail }) => sendPlanUpgradeEmail(user, tx.plan, quota))
              .catch((err) => console.warn("Async upgrade email error:", err));
          }
        })
        .catch(() => {});

      const successMsg = tx.isCreditTopup && tx.creditsPurchased
        ? `Transaction approved! Added ${tx.creditsPurchased.toLocaleString()} non-expiring credits to workspace.`
        : `Transaction approved! Workspace upgraded to ${tx.plan} (${quota.toLocaleString()} emails/day).`;

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
