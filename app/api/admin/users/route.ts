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

    const totalUsers = users.length;
    const totalAdmins = users.filter((u) => u.role === "ADMIN").length;
    const activeWorkspacesCount = await prisma.workspace.count();

    return NextResponse.json({
      users,
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
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, workspaceId, role, plan, dailyQuota, resetUsedToday } = body;

    // 1. Update user role if provided
    if (userId && role) {
      await prisma.user.update({
        where: { id: userId },
        data: { role },
      });
      logSecurityAudit("USER_ROLE_CHANGED", session.userId, { targetUserId: userId, newRole: role });
    }

    // 2. Update workspace settings (plan, quota, reset counter)
    if (workspaceId) {
      const updateData: any = {};
      if (plan) updateData.plan = plan;
      if (dailyQuota !== undefined) updateData.dailyQuota = Number(dailyQuota);
      if (resetUsedToday) updateData.usedToday = 0;

      await prisma.workspace.update({
        where: { id: workspaceId },
        data: updateData,
      });

      logSecurityAudit("WORKSPACE_ADMIN_MODIFIED", session.userId, { workspaceId, updateData });
    }

    return NextResponse.json({
      success: true,
      message: "Account settings updated successfully.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
