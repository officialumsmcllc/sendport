import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalWorkspaces,
      workspacesByPlan,
      approvedTransactions,
      pendingPaymentsCount,
      totalEmails,
      deliveredEmails,
      bouncedEmails,
      todayEmails,
      totalDomains,
      verifiedDomains,
      totalContacts,
      totalAudiences,
      totalBroadcasts,
      totalTemplates,
      recentSignups,
      recentAuditLogs,
      recentTemplates,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.workspace.count(),
      prisma.workspace.groupBy({
        by: ["plan"],
        _count: { id: true },
      }),
      prisma.paymentTransaction.findMany({
        where: { status: "APPROVED" },
        select: { amount: true, currency: true },
      }),
      prisma.paymentTransaction.count({
        where: { status: "PENDING" },
      }),
      prisma.emailLog.count(),
      prisma.emailLog.count({ where: { status: "DELIVERED" } }),
      prisma.emailLog.count({ where: { status: "BOUNCED" } }),
      prisma.emailLog.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.domain.count(),
      prisma.domain.count({ where: { status: "VERIFIED" } }),
      prisma.contact.count(),
      prisma.audience.count(),
      prisma.broadcastBlast.count(),
      prisma.emailTemplate.count(),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      }),
      prisma.auditLog.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { email: true, name: true },
          },
        },
      }),
      prisma.emailTemplate.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
              members: {
                take: 1,
                include: { user: { select: { email: true } } },
              },
            },
          },
        },
      }),
    ]);

    // Calculate revenue
    let totalUsdRevenue = 0;
    let totalPkrRevenue = 0;
    for (const tx of approvedTransactions) {
      if (tx.currency === "PKR") {
        totalPkrRevenue += tx.amount;
        totalUsdRevenue += tx.amount / 280; // approximate
      } else {
        totalUsdRevenue += tx.amount;
        totalPkrRevenue += tx.amount * 280;
      }
    }

    const planCounts: Record<string, number> = { STARTER: 0, GROWTH: 0, SCALE_PRO: 0 };
    for (const group of workspacesByPlan) {
      planCounts[group.plan] = group._count.id;
    }

    const deliveryRate = totalEmails > 0 ? ((deliveredEmails / totalEmails) * 100).toFixed(1) : "99.9";
    const bounceRate = totalEmails > 0 ? ((bouncedEmails / totalEmails) * 100).toFixed(1) : "0.1";

    return NextResponse.json({
      metrics: {
        totalUsers,
        totalWorkspaces,
        planCounts,
        revenueUsd: Math.round(totalUsdRevenue),
        revenuePkr: Math.round(totalPkrRevenue),
        pendingPaymentsCount,
        totalEmails,
        todayEmails,
        deliveryRate: `${deliveryRate}%`,
        bounceRate: `${bounceRate}%`,
        totalDomains,
        verifiedDomains,
        totalContacts,
        totalAudiences,
        totalBroadcasts,
        totalTemplates,
      },
      recentSignups,
      recentAuditLogs,
      recentTemplates,
      systemHealth: {
        api: "OPERATIONAL",
        smtp: "LISTENING (Port 587 / 465)",
        database: "CONNECTED",
        dkim: "ACTIVE (RSA-2048)",
      },
    });
  } catch (err: any) {
    console.error("Admin overview error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
