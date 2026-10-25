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

    // 3. Query actual EmailLog counts for each campaign to show verified delivery truth
    let totalTargeted = 0;
    let totalSent = 0;
    let totalFailed = 0;
    let totalRemaining = 0;
    let activeSendingCount = 0;

    const formattedCampaigns = await Promise.all(
      blasts.map(async (b) => {
        let actualDelivered = 0;
        let actualFailed = 0;
        let actualPending = 0;

        try {
          const logStats = await prisma.emailLog.groupBy({
            by: ["status"],
            where: {
              workspaceId: b.workspaceId,
              subject: b.subject,
            },
            _count: { id: true },
          });

          for (const s of logStats) {
            const statusUpper = (s.status || "").toUpperCase();
            if (statusUpper === "DELIVERED" || statusUpper === "OPENED" || statusUpper === "CLICKED") {
              actualDelivered += s._count.id;
            } else if (statusUpper === "FAILED" || statusUpper === "BOUNCED" || statusUpper === "COMPLAINED") {
              actualFailed += s._count.id;
            } else {
              actualPending += s._count.id;
            }
          }
        } catch (e) {
          // fallback to stored blast counts if log query fails
        }

        const hasRealLogs = actualDelivered + actualFailed + actualPending > 0;
        const verifiedSent = hasRealLogs ? actualDelivered : b.sentCount;
        const verifiedFailed = hasRealLogs ? actualFailed : b.failedCount;
        const verifiedRemaining = hasRealLogs
          ? actualPending
          : Math.max(0, b.totalRecipients - (b.sentCount + b.failedCount));

        const progressPercent =
          b.totalRecipients > 0
            ? Math.min(100, Math.round((verifiedSent / b.totalRecipients) * 100))
            : 100;

        totalTargeted += b.totalRecipients || 0;
        totalSent += verifiedSent;
        totalFailed += verifiedFailed;
        totalRemaining += verifiedRemaining;

        let verifiedStatus = b.status || "COMPLETED";
        if (hasRealLogs) {
          if (actualPending > 0) {
            verifiedStatus = "SENDING";
          } else if (verifiedSent > 0 && verifiedFailed === 0) {
            verifiedStatus = "COMPLETED";
          } else if (verifiedSent > 0 && verifiedFailed > 0) {
            verifiedStatus = "PARTIAL";
          } else if (verifiedSent === 0 && verifiedFailed > 0) {
            verifiedStatus = "FAILED";
          }
        }

        if (verifiedStatus === "SENDING") {
          activeSendingCount += 1;
        }

        const owner = b.workspace?.members?.[0]?.user;

        return {
          id: b.id,
          subject: b.subject,
          fromName: b.fromName || "System",
          fromEmail: b.fromEmail,
          totalRecipients: b.totalRecipients,
          sentCount: verifiedSent,
          failedCount: verifiedFailed,
          remainingCount: verifiedRemaining,
          progressPercent,
          status: verifiedStatus,
          workspaceId: b.workspaceId,
          workspaceName: b.workspace?.name || "Global Workspace",
          ownerName: owner?.name || "Customer",
          ownerEmail: owner?.email || "N/A",
          audienceId: b.audienceId,
          audienceName: audienceMap.get(b.audienceId) || "Direct Audience List",
          createdAt: b.createdAt,
        };
      })
    );

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
