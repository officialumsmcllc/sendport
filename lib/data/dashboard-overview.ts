import { prisma } from "@/lib/db/prisma";

export interface DashboardInitialData {
  user: {
    id: string;
    email: string;
    name?: string | null;
    role: string;
  };
  domains: Array<{
    id: string;
    name: string;
    status: string;
    verifiedAt: Date | null;
  }>;
  apiKeysCount: number;
  stats: {
    sent: number;
    delivered: number;
    deliveredRate: string;
    opened: number;
    openRate: string;
    clicked: number;
    clickRate: string;
    bounced: number;
    bounceRate: string;
    quotaToday: number;
    quotaTotal: number;
    plan: string;
  };
  recentEmails: Array<{
    id: string;
    to: string;
    from: string;
    subject: string;
    status: string;
    time: string;
    date: string;
    dkim: boolean;
    domain: string;
    domainId?: string | null;
  }>;
}

/**
 * Direct Server-Side Data Fetcher for User Dashboard Overview.
 * Runs inside Next.js Server Components for 0ms initial load.
 */
export async function getDashboardOverviewData(
  workspaceId: string,
  user: { id: string; email: string; name?: string | null; role: string }
): Promise<DashboardInitialData> {
  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);

  const logWhere = { workspaceId };

  const [workspace, domains, apiKeysCount, total, delivered, opened, clicked, bounced, todayCount, logs] =
    await Promise.all([
      prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { dailyQuota: true, usedToday: true, plan: true },
      }),
      prisma.domain.findMany({
        where: { workspaceId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          status: true,
          verifiedAt: true,
        },
      }),
      prisma.apiKey.count({ where: { workspaceId } }),
      prisma.emailLog.count({ where: logWhere }),
      prisma.emailLog.count({ where: { ...logWhere, status: "DELIVERED" } }),
      prisma.emailLog.count({ where: { ...logWhere, status: "OPENED" } }),
      prisma.emailLog.count({ where: { ...logWhere, status: "CLICKED" } }),
      prisma.emailLog.count({ where: { ...logWhere, status: "BOUNCED" } }),
      prisma.emailLog.count({ where: { workspaceId, createdAt: { gte: startOfToday } } }),
      prisma.emailLog.findMany({
        where: logWhere,
        take: 50,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          to: true,
          from: true,
          subject: true,
          status: true,
          createdAt: true,
          dkimSigned: true,
          domainId: true,
          domain: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      }),
    ]);

  const recentEmails = logs.map((l) => ({
    id: l.id,
    to: l.to,
    from: l.from,
    subject: l.subject,
    status: l.status,
    time: new Date(l.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    date: new Date(l.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }),
    dkim: l.dkimSigned,
    domain: l.domain?.name || l.from.split("@")[1]?.replace(/[<>]/g, "").trim() || "unknown",
    domainId: l.domainId,
  }));

  const totalDelivered = delivered + opened + clicked;
  const totalOpened = opened + clicked;

  const stats = {
    sent: totalDelivered + bounced,
    delivered: totalDelivered,
    deliveredRate: total > 0 ? `${Math.round((totalDelivered / total) * 100)}%` : "0%",
    opened: totalOpened,
    openRate: total > 0 ? `${Math.round((totalOpened / total) * 100)}%` : "0%",
    clicked,
    clickRate: total > 0 ? `${Math.round((clicked / total) * 100)}%` : "0%",
    bounced,
    bounceRate: total > 0 ? `${Math.round((bounced / total) * 100)}%` : "0%",
    quotaToday: todayCount,
    quotaTotal: workspace?.dailyQuota || 100,
    plan: workspace?.plan || "STARTER",
  };

  return {
    user,
    domains,
    apiKeysCount,
    stats,
    recentEmails,
  };
}
