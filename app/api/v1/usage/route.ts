import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Missing or invalid Authorization header or active session." },
        { status: 401 }
      );
    }

    const workspaceData = await prisma.workspace.findUnique({
      where: { id: auth.workspace.id },
      include: {
        domains: true,
        audiences: {
          include: {
            _count: {
              select: { contacts: true },
            },
          },
        },
      },
    });

    if (!workspaceData) {
      return NextResponse.json({ error: "WorkspaceNotFound" }, { status: 404 });
    }

    const workspace = workspaceData;
    const remainingToday = Math.max(0, workspace.dailyQuota - workspace.usedToday);
    const totalContacts = workspace.audiences.reduce(
      (sum, aud) => sum + (aud._count?.contacts || 0),
      0
    );

    return NextResponse.json({
      object: "account_usage",
      workspace_id: workspace.id,
      workspace_name: workspace.name,
      plan: workspace.plan,
      daily_quota: workspace.dailyQuota,
      used_today: workspace.usedToday,
      remaining_today: remainingToday,
      quota_reset_at: workspace.quotaResetAt,
      verified_domains_count: workspace.domains.filter((d) => d.status === "VERIFIED").length,
      total_domains_count: workspace.domains.length,
      audiences_count: workspace.audiences.length,
      total_contacts_count: totalContacts,
    });
  } catch (error: any) {
    console.error("Usage API Error:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: error.message },
      { status: 500 }
    );
  }
}
