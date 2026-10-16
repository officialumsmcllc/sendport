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

export function defaultDashboardData(
  user: { id: string; email: string; name?: string | null; role: string }
): DashboardInitialData {
  return {
    user,
    domains: [],
    apiKeysCount: 0,
    stats: {
      sent: 0,
      delivered: 0,
      deliveredRate: "0%",
      opened: 0,
      openRate: "0%",
      clicked: 0,
      clickRate: "0%",
      bounced: 0,
      bounceRate: "0%",
      quotaToday: 0,
      quotaTotal: 100,
      plan: "STARTER",
    },
    recentEmails: [],
  };
}

/**
 * Direct Server-Side Data Fetcher for User Dashboard Overview.
 * Runs inside Next.js Server Components with crash-proof fallback.
 */
export async function getDashboardOverviewData(
  workspaceId: string,
  user: { id: string; email: string; name?: string | null; role: string }
): Promise<DashboardInitialData> {
  try {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const userMemberships = await prisma.workspaceMember.findMany({
      where: { userId: user.id },
      select: { workspaceId: true },
    }).catch(() => []);

    const userWorkspaceIds = userMemberships.map((m: any) => m.workspaceId);
    const allWorkspaceIds = Array.from(new Set([workspaceId, ...userWorkspaceIds].filter(Boolean)));

    const logWhere = {
      OR: [
        { workspaceId: { in: allWorkspaceIds } },
        { domain: { userId: user.id } },
      ],
    };

    const [workspace, domains, apiKeysCount, total, delivered, opened, clicked, bounced, todayCount, logs] =
      await Promise.all([
        prisma.workspace.findUnique({
          where: { id: workspaceId },
          select: { dailyQuota: true, usedToday: true, plan: true },
        }).catch(() => null),
        prisma.domain.findMany({
          where: {
            OR: [
              { workspaceId: { in: allWorkspaceIds } },
              { userId: user.id },
              { user: { email: user.email } },
            ],
          },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            status: true,
            verifiedAt: true,
          },
        }).catch(() => []),
        prisma.apiKey.count({
          where: {
            OR: [
              { workspaceId: { in: allWorkspaceIds } },
              { userId: user.id },
            ],
          },
        }).catch(() => 0),
        prisma.emailLog.count({ where: logWhere }).catch(() => 0),
        prisma.emailLog.count({ where: { ...logWhere, status: "DELIVERED" } }).catch(() => 0),
        prisma.emailLog.count({ where: { ...logWhere, status: "OPENED" } }).catch(() => 0),
        prisma.emailLog.count({ where: { ...logWhere, status: "CLICKED" } }).catch(() => 0),
        prisma.emailLog.count({ where: { ...logWhere, status: "BOUNCED" } }).catch(() => 0),
        prisma.emailLog.count({ where: { workspaceId: { in: allWorkspaceIds }, createdAt: { gte: startOfToday } } }).catch(() => 0),
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
        }).catch(() => []),
      ]);

    const recentEmails = (logs || []).map((l: any) => ({
      id: l.id,
      to: l.to,
      from: l.from,
      subject: l.subject,
      status: l.status,
      time: new Date(l.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: new Date(l.createdAt).toLocaleDateString([], { month: "short", day: "numeric" }),
      dkim: l.dkimSigned,
      domain: l.domain?.name || (l.from?.includes("@") ? l.from.split("@")[1]?.replace(/[<>]/g, "").trim() : "unknown") || "unknown",
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
      domains: domains || [],
      apiKeysCount,
      stats,
      recentEmails,
    };
  } catch (err) {
    console.error("[CRITICAL] getDashboardOverviewData failed, returning fallback:", err);
    return defaultDashboardData(user);
  }
}
