// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    // 1. Fetch all broadcast blasts across all workspaces
    let blasts: any[] = [];
    try {
      blasts = await prisma.broadcastBlast.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
              members: {
                take: 1,
                select: {
                  user: {
                    select: {
                      name: true,
                      email: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    } catch (dbErr: any) {
      console.warn("[ADMIN CAMPAIGNS DB WARNING]:", dbErr.message);
      blasts = [];
    }

    // 2. Resolve audience names in bulk
    const audienceIds = Array.from(new Set(blasts.map((b) => b.audienceId).filter(Boolean)));
    const audiences = audienceIds.length > 0
      ? await prisma.audience.findMany({
          where: { id: { in: audienceIds } },
          select: { id: true, name: true },
        })
      : [];

    const audienceMap = new Map(audiences.map((a) => [a.id, a.name]));

    // 3. Compute aggregate statistics
    let totalTargeted = 0;
    let totalSent = 0;
    let totalFailed = 0;
    let totalRemaining = 0;
    let activeSendingCount = 0;

    const formattedCampaigns = blasts.map((b) => {
      const remaining = Math.max(0, b.totalRecipients - (b.sentCount + b.failedCount));
      const progressPercent =
        b.totalRecipients > 0
          ? Math.min(100, Math.round((b.sentCount / b.totalRecipients) * 100))
          : 100;

      totalTargeted += b.totalRecipients || 0;
      totalSent += b.sentCount || 0;
      totalFailed += b.failedCount || 0;
      totalRemaining += remaining;

      if (b.status === "SENDING") {
        activeSendingCount += 1;
      }

      const owner = b.workspace?.members?.[0]?.user;

      return {
        id: b.id,
        subject: b.subject,
        fromName: b.fromName || "System",
        fromEmail: b.fromEmail,
        totalRecipients: b.totalRecipients,
        sentCount: b.sentCount,
        failedCount: b.failedCount,
        remainingCount: remaining,
        progressPercent,
        status: b.status || "COMPLETED",
        workspaceId: b.workspaceId,
        workspaceName: b.workspace?.name || "Global Workspace",
        ownerName: owner?.name || "Customer",
        ownerEmail: owner?.email || "N/A",
        audienceId: b.audienceId,
        audienceName: audienceMap.get(b.audienceId) || "Direct Audience List",
        createdAt: b.createdAt,
      };
    });

    return NextResponse.json({
      metrics: {
        totalCampaigns: blasts.length,
        totalTargeted,
        totalSent,
        totalRemaining,
        totalFailed,
        activeSendingCount,
      },
      campaigns: formattedCampaigns,
    });
  } catch (error: any) {
    console.error("[ADMIN CAMPAIGNS API ERROR]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
