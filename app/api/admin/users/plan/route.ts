import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";
import { logSecurityAudit } from "@/lib/security/audit";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { email, plan, dailyQuota } = body;

    if (!email || !plan) {
      return NextResponse.json({ error: "Email and plan are required fields." }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        workspaces: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: `User with email "${cleanEmail}" not found.` }, { status: 404 });
    }

    const targetWorkspace = user.workspaces[0]?.workspace;
    if (!targetWorkspace) {
      return NextResponse.json({ error: "User has no active workspace associated." }, { status: 400 });
    }

    const parsedQuota = dailyQuota !== undefined ? Number(dailyQuota) : targetWorkspace.dailyQuota;

    const updatedWorkspace = await prisma.workspace.update({
      where: { id: targetWorkspace.id },
      data: {
        plan,
        dailyQuota: parsedQuota,
      },
    });

    logSecurityAudit("ADMIN_USER_PLAN_UPGRADE", session.userId, {
      targetUserId: user.id,
      targetUserEmail: cleanEmail,
      workspaceId: targetWorkspace.id,
      oldPlan: targetWorkspace.plan,
      newPlan: plan,
      newQuota: parsedQuota,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${cleanEmail} to ${plan} (${parsedQuota.toLocaleString()} emails/day).`,
      workspace: updatedWorkspace,
    });
  } catch (error: any) {
    console.error("Admin user plan update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update user plan." }, { status: 500 });
  }
}
