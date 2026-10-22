import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";
import { logSecurityAudit } from "@/lib/security/audit";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const subscriptions = await prisma.subscription.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, email: true, name: true },
        },
      },
    });

    // Also get all users with their active workspace plan so admin can create/upgrade any user subscription
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        workspaces: {
          select: {
            workspace: {
              select: { id: true, name: true, plan: true, dailyQuota: true },
            },
          },
        },
      },
    });

    const now = Date.now();
    const enrichedSubscriptions = subscriptions.map((s) => {
      let daysRemaining: number | null = null;
      let isExpired = false;
      if (s.expiresAt) {
        const diffMs = new Date(s.expiresAt).getTime() - now;
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        isExpired = daysRemaining <= 0;
      }
      return {
        ...s,
        daysRemaining,
        isExpired,
      };
    });

    return NextResponse.json({
      success: true,
      subscriptions: enrichedSubscriptions,
      users,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, plan, billingCycle, dailyLimit, amount, status, expiryDays } = body;

    if (!userId || !plan) {
      return NextResponse.json({ error: "User ID and plan are required." }, { status: 400 });
    }

    const quota = Number(dailyLimit) || (plan === "SCALE_PRO" ? 25000 : plan === "GROWTH" ? 3000 : 100);
    const defaultDays = billingCycle === "ANNUAL" ? 365 : 30;
    const effectiveDays = expiryDays ? Number(expiryDays) : defaultDays;
    const expiresAt = new Date(Date.now() + effectiveDays * 24 * 60 * 60 * 1000);

    // Create or update subscription record
    const sub = await prisma.subscription.create({
      data: {
        userId,
        plan,
        billingCycle: billingCycle || "MONTHLY",
        dailyLimit: quota,
        amount: Number(amount) || 0,
        status: status || "ACTIVE",
        expiresAt,
      },
    });

    // Automatically sync workspace daily quota, plan and planExpiresAt
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { workspaces: true },
    });

    if (user?.workspaces) {
      for (const wm of user.workspaces) {
        await prisma.workspace.update({
          where: { id: wm.workspaceId },
          data: {
            plan,
            dailyQuota: quota,
            planExpiresAt: expiresAt,
            isPlanExpired: false,
          },
        });
      }
    }

    logSecurityAudit("MANUAL_SUBSCRIPTION_PROVISIONED", session.userId, {
      targetUserId: userId,
      plan,
      quota,
      expiresAt,
      effectiveDays,
    });

    // Send Plan Upgrade Confirmation Email from no-reply@getsendport.com
    if (user?.email) {
      import("@/lib/email/system-mailer")
        .then(({ sendPlanUpgradeEmail }) => sendPlanUpgradeEmail(user, plan, quota))
        .catch((err) => console.warn("Async upgrade email error:", err));
    }

    return NextResponse.json({
      success: true,
      message: `User upgraded to ${plan} (${quota.toLocaleString()} emails/day, ${effectiveDays} days active) successfully!`,
      subscription: {
        ...sub,
        daysRemaining: effectiveDays,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, status, plan, dailyLimit } = body;

    const sub = await prisma.subscription.findUnique({ where: { id } });
    if (!sub) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    const updated = await prisma.subscription.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(plan && { plan }),
        ...(dailyLimit && { dailyLimit: Number(dailyLimit) }),
      },
    });

    if (plan || dailyLimit) {
      const user = await prisma.user.findUnique({
        where: { id: sub.userId },
        include: { workspaces: true },
      });
      if (user?.workspaces) {
        const newQuota = Number(dailyLimit) || (plan === "SCALE_PRO" ? 25000 : plan === "GROWTH" ? 3000 : 100);
        for (const wm of user.workspaces) {
          await prisma.workspace.update({
            where: { id: wm.workspaceId },
            data: {
              ...(plan && { plan }),
              dailyQuota: newQuota,
            },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Subscription status updated.",
      subscription: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
