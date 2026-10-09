import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { logSecurityAudit } from "@/lib/security/audit";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
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

    return NextResponse.json({
      success: true,
      subscriptions,
      users,
    });
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
    const { userId, plan, billingCycle, dailyLimit, amount, status, expiryDays } = body;

    if (!userId || !plan) {
      return NextResponse.json({ error: "User ID and plan are required." }, { status: 400 });
    }

    const quota = Number(dailyLimit) || (plan === "SCALE_PRO" ? 25000 : plan === "GROWTH" ? 3000 : 100);
    const expiresAt = expiryDays ? new Date(Date.now() + Number(expiryDays) * 24 * 60 * 60 * 1000) : null;

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

    // Automatically sync workspace daily quota and plan
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
          },
        });
      }
    }

    logSecurityAudit("MANUAL_SUBSCRIPTION_PROVISIONED", session.userId, {
      targetUserId: userId,
      plan,
      quota,
      expiresAt,
    });

    return NextResponse.json({
      success: true,
      message: `User upgraded to ${plan} (${quota.toLocaleString()} emails/day) successfully!`,
      subscription: sub,
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
