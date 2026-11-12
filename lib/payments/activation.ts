
import { prisma } from "@/lib/db/prisma";
import { logSecurityAudit } from "@/lib/security/audit";

/**
 * Activates a paid order (Plan upgrade or Credits pack).
 * Used by Cryptomus automated webhooks and Admin manual approvals.
 */
export async function activatePaymentOrder(
  transactionId: string,
  approvalNotes: string = "Cryptomus Automated Blockchain Verification"
): Promise<{ success: boolean; error?: string }> {
  try {
    const tx = await prisma.paymentTransaction.findUnique({
      where: { id: transactionId },
      include: { user: true },
    });

    if (!tx) {
      return { success: false, error: `Transaction '${transactionId}' not found.` };
    }

    if (tx.status === "APPROVED") {
      // Already activated; avoid double-crediting
      return { success: true };
    }

    // 1. Update Payment Transaction record
    await prisma.paymentTransaction.update({
      where: { id: tx.id },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        adminNotes: approvalNotes,
      },
    });

    // 2. Resolve Workspace IDs belonging to this user
    const members = await prisma.workspaceMember.findMany({
      where: { userId: tx.userId },
      select: { workspaceId: true },
    });

    let workspaceIds: string[] = members.map((m) => m.workspaceId);
    const quota = tx.plan === "SCALE_PRO" ? 25000 : tx.plan === "GROWTH" ? 3000 : 100;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days validity

    if (workspaceIds.length === 0) {
      const u = await prisma.user.findUnique({
        where: { id: tx.userId },
        include: { workspaces: true },
      });
      if (u?.workspaces && u.workspaces.length > 0) {
        workspaceIds = u.workspaces.map((w: any) => w.workspaceId);
      } else if (u) {
        const slug = `ws-${(u.email.split("@")[0] || "user").replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}-${Date.now().toString(36)}`;
        const newWs = await prisma.workspace.create({
          data: {
            name: `${u.name || u.email.split("@")[0]}'s Workspace`,
            slug,
            plan: tx.isCreditTopup ? "STARTER" : tx.plan,
            dailyQuota: tx.isCreditTopup ? 100 : quota,
            credits: tx.isCreditTopup && tx.creditsPurchased ? tx.creditsPurchased : 0,
            planExpiresAt: tx.isCreditTopup ? null : expiresAt,
            isPlanExpired: false,
            members: {
              create: {
                userId: u.id,
                role: "OWNER",
              },
            },
          },
        });
        workspaceIds = [newWs.id];
      }
    }

    // 3. Apply Quotas or Credits to all user workspaces
    if (tx.isCreditTopup && tx.creditsPurchased) {
      for (const wsId of workspaceIds) {
        await prisma.workspace.update({
          where: { id: wsId },
          data: {
            credits: { increment: tx.creditsPurchased },
          },
        });
      }
    } else {
      for (const wsId of workspaceIds) {
        await prisma.workspace.update({
          where: { id: wsId },
          data: {
            plan: tx.plan,
            dailyQuota: quota,
            planExpiresAt: expiresAt,
            isPlanExpired: false,
          },
        });
      }

      // Sync Subscription table
      try {
        const existingSub = await prisma.subscription.findFirst({ where: { userId: tx.userId } });
        if (existingSub) {
          await prisma.subscription.update({
            where: { id: existingSub.id },
            data: { plan: tx.plan, dailyLimit: quota, status: "ACTIVE" },
          });
        } else {
          await prisma.subscription.create({
            data: { userId: tx.userId, plan: tx.plan, dailyLimit: quota, status: "ACTIVE" },
          });
        }
      } catch (_) {}
    }

    // 4. Log Security Audit
    logSecurityAudit("PAYMENT_APPROVED", tx.userId, {
      transactionId: tx.id,
      plan: tx.plan,
      isCreditTopup: tx.isCreditTopup,
      creditsPurchased: tx.creditsPurchased,
      source: "CRYPTOMUS_WEBHOOK",
    });

    // 5. Send Plan Upgrade Notification Email asynchronously
    prisma.user.findUnique({ where: { id: tx.userId }, select: { email: true, name: true } })
      .then((user) => {
        if (user?.email) {
          import("@/lib/email/system-mailer")
            .then(({ sendPlanUpgradeEmail }) => sendPlanUpgradeEmail(user, tx.plan, quota))
            .catch((err) => console.warn("[UPGRADE_EMAIL_ASYNC_ERR]:", err));
        }
      })
      .catch(() => {});

    return { success: true };
  } catch (error: any) {
    console.error("[ACTIVATE_ORDER_ERROR]:", error);
    return { success: false, error: error.message };
  }
}

