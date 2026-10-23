import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";
import { logSecurityAudit } from "@/lib/security/audit";
import { hashPassword } from "@/lib/auth/password";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        twoFactorEnabled: true,
        createdAt: true,
        workspaces: {
          include: {
            workspace: {
              select: {
                id: true,
                name: true,
                plan: true,
                dailyQuota: true,
                usedToday: true,
                planExpiresAt: true,
                isPlanExpired: true,
              },
            },
          },
        },
        _count: {
          select: {
            domains: true,
            apiKeys: true,
            payments: true,
          },
        },
      },
    });

    const now = Date.now();
    const enrichedUsers = users.map((u) => {
      const ws = u.workspaces?.[0]?.workspace;
      let daysRemaining: number | null = null;
      let isExpired = false;
      if (ws?.planExpiresAt) {
        const diffMs = new Date(ws.planExpiresAt).getTime() - now;
        daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        isExpired = daysRemaining <= 0 || Boolean(ws.isPlanExpired);
      }
      return {
        ...u,
        workspaces: u.workspaces.map((w) => ({
          ...w,
          workspace: {
            ...w.workspace,
            daysRemaining,
            isExpired,
          },
        })),
      };
    });

    const totalUsers = users.length;
    const totalAdmins = users.filter((u) => u.role === "ADMIN").length;
    const activeWorkspacesCount = await prisma.workspace.count();

    return NextResponse.json({
      users: enrichedUsers,
      stats: {
        totalUsers,
        totalAdmins,
        activeWorkspacesCount,
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
    const { userId, workspaceId, role, plan, dailyQuota, resetUsedToday, newPassword, expiryDays, planExpiresAt } = body;

    // 1. Update user password directly if provided by admin
    if (userId && newPassword) {
      if (typeof newPassword !== "string" || newPassword.trim().length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }
      const passwordHash = hashPassword(newPassword.trim());
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash },
      });
      logSecurityAudit("ADMIN_USER_PASSWORD_RESET", session.userId, { targetUserId: userId });
    }

    // 2. Update user role if provided
    if (userId && role) {
      await prisma.user.update({
        where: { id: userId },
        data: { role },
      });
      logSecurityAudit("USER_ROLE_CHANGED", session.userId, { targetUserId: userId, newRole: role });
    }

    // 3. Update workspace settings (plan, quota, reset counter, validity)
    let updatedExpiresAt: Date | null | undefined = undefined;
    if (workspaceId) {
      const updateData: any = {};
      if (plan) updateData.plan = plan;
      if (dailyQuota !== undefined) updateData.dailyQuota = Number(dailyQuota);
      if (resetUsedToday) updateData.usedToday = 0;

      if (expiryDays !== undefined) {
        if (expiryDays === null || Number(expiryDays) <= 0) {
          updateData.planExpiresAt = null;
          updateData.isPlanExpired = false;
          updatedExpiresAt = null;
        } else {
          const exp = new Date(Date.now() + Number(expiryDays) * 24 * 60 * 60 * 1000);
          updateData.planExpiresAt = exp;
          updateData.isPlanExpired = false;
          updatedExpiresAt = exp;
        }
      } else if (planExpiresAt !== undefined) {
        const exp = planExpiresAt ? new Date(planExpiresAt) : null;
        updateData.planExpiresAt = exp;
        updateData.isPlanExpired = false;
        updatedExpiresAt = exp;
      }

      await prisma.workspace.update({
        where: { id: workspaceId },
        data: updateData,
      });

      logSecurityAudit("WORKSPACE_ADMIN_MODIFIED", session.userId, { workspaceId, updateData });
    }

    // 4. Keep Subscription record in sync with workspace plan and expiry
    if (userId && (plan || updatedExpiresAt !== undefined)) {
      try {
        const existingSub = await prisma.subscription.findFirst({
          where: { userId },
        });
        if (existingSub) {
          await prisma.subscription.update({
            where: { id: existingSub.id },
            data: {
              ...(plan ? { plan } : {}),
              ...(dailyQuota !== undefined ? { dailyLimit: Number(dailyQuota) } : {}),
              ...(updatedExpiresAt !== undefined ? { expiresAt: updatedExpiresAt } : {}),
              status: "ACTIVE",
            },
          });
        } else if (plan) {
          await prisma.subscription.create({
            data: {
              userId,
              plan,
              dailyLimit: dailyQuota !== undefined ? Number(dailyQuota) : 500,
              expiresAt: updatedExpiresAt || null,
              status: "ACTIVE",
            },
          });
        }
      } catch (_) {}
    }

    // Send confirmation email if plan was updated
    if (userId && plan) {
      prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } })
        .then((u) => {
          if (u?.email) {
            import("@/lib/email/system-mailer")
              .then(({ sendPlanUpgradeEmail }) => sendPlanUpgradeEmail(u, plan, dailyQuota ? Number(dailyQuota) : (plan === "SCALE_PRO" ? 25000 : plan === "GROWTH" ? 3000 : 100)))
              .catch(() => {});
          }
        })
        .catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: "Account settings updated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
