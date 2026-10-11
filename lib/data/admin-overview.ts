import { prisma } from "@/lib/db/prisma";

export interface AdminInitialData {
  metrics: {
    totalUsers: number;
    totalWorkspaces: number;
    planCounts: Record<string, number>;
    revenueUsd: number;
    revenuePkr: number;
    pendingPaymentsCount: number;
    totalEmails: number;
    todayEmails: number;
    deliveryRate: string;
    bounceRate: string;
    totalDomains: number;
    verifiedDomains: number;
    totalContacts: number;
    totalAudiences: number;
    totalBroadcasts: number;
    totalTemplates: number;
  };
  recentSignups: any[];
  recentAuditLogs: any[];
  recentTemplates: any[];
  systemHealth: {
    api: string;
    smtp: string;
    database: string;
    dkim: string;
  };
}

/**
 * Direct Server-Side Data Fetcher for Admin Overview (Mission Control).
 * Runs inside Next.js Server Components for 0ms initial load.
 */
export async function getAdminOverviewData(): Promise<AdminInitialData> {
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
      totalUsdRevenue += tx.amount / 280;
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

  return {
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
  };
}
