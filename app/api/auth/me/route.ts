import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const workspaceId = auth.workspace.id;
    const { searchParams } = new URL(req.url);
    const domainFilter = searchParams.get("domain")?.trim();

    // Fetch this workspace's registered domains
    const domains = await prisma.domain.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        status: true,
        verifiedAt: true,
      },
    });

    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    // Build log filter - strictly bounded to this user's workspace
    const logWhere: any = { workspaceId };
    if (domainFilter && domainFilter !== "ALL") {
      logWhere.OR = [
        { domain: { name: { equals: domainFilter, mode: "insensitive" } } },
        { from: { contains: domainFilter, mode: "insensitive" } },
      ];
    }

    const [total, delivered, opened, clicked, bounced, todayCount, logs] = await Promise.all([
      prisma.emailLog.count({ where: logWhere }),
      prisma.emailLog.count({ where: { ...logWhere, status: "DELIVERED" } }),
      prisma.emailLog.count({ where: { ...logWhere, status: "OPENED" } }),
      prisma.emailLog.count({ where: { ...logWhere, status: "CLICKED" } }),
      prisma.emailLog.count({ where: { ...logWhere, status: "BOUNCED" } }),
      prisma.emailLog.count({ where: { workspaceId, createdAt: { gte: startOfToday } } }),
      prisma.emailLog.findMany({
        where: logWhere,
        take: 100,
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

    const stats = {
      delivered: delivered + opened + clicked,
      deliveredRate: total > 0 ? `${Math.round(((delivered + opened + clicked) / total) * 100)}%` : "0%",
      opened: opened + clicked,
      openRate: total > 0 ? `${Math.round(((opened + clicked) / total) * 100)}%` : "0%",
      clicked,
      clickRate: total > 0 ? `${Math.round((clicked / total) * 100)}%` : "0%",
      bounced,
      bounceRate: total > 0 ? `${Math.round((bounced / total) * 100)}%` : "0%",
      usedToday: todayCount,
      dailyQuota: auth.workspace.dailyQuota || 100,
      plan: auth.workspace.plan || "STARTER",
    };

    // Update real-time daily counter
    prisma.workspace
      .update({
        where: { id: workspaceId },
        data: { usedToday: todayCount },
      })
      .catch(() => {});

    return NextResponse.json({
      authenticated: true,
      user: {
        ...auth.user,
        workspaces: [
          {
            workspace: {
              ...auth.workspace,
              usedToday: todayCount,
            },
          },
        ],
      },
      workspace: {
        ...auth.workspace,
        usedToday: todayCount,
      },
      domains,
      stats,
      recentEmails,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch user profile" }, { status: 500 });
  }
}
