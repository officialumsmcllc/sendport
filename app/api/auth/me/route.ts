import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        twoFactorEnabled: true,
        createdAt: true,
        workspaces: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const primaryWorkspace = user.workspaces?.[0]?.workspace;
    let stats = {
      delivered: 0,
      deliveredRate: "0%",
      opened: 0,
      openRate: "0%",
      clicked: 0,
      clickRate: "0%",
      bounced: 0,
      bounceRate: "0%",
      usedToday: primaryWorkspace?.usedToday || 0,
      dailyQuota: primaryWorkspace?.dailyQuota || 500,
      plan: primaryWorkspace?.plan || "STARTER",
    };

    let recentEmails: any[] = [];
    const workspaceIds = user.workspaces?.map((w) => w.workspace.id) || [];

    if (workspaceIds.length > 0) {
      const [total, delivered, opened, clicked, bounced, logs] = await Promise.all([
        prisma.emailLog.count({ where: { workspaceId: { in: workspaceIds } } }),
        prisma.emailLog.count({ where: { workspaceId: { in: workspaceIds }, status: "DELIVERED" } }),
        prisma.emailLog.count({ where: { workspaceId: { in: workspaceIds }, status: "OPENED" } }),
        prisma.emailLog.count({ where: { workspaceId: { in: workspaceIds }, status: "CLICKED" } }),
        prisma.emailLog.count({ where: { workspaceId: { in: workspaceIds }, status: "BOUNCED" } }),
        prisma.emailLog.findMany({
          where: { workspaceId: { in: workspaceIds } },
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
          },
        }),
      ]);

      recentEmails = logs.map((l) => ({
        id: l.id,
        to: l.to,
        from: l.from,
        subject: l.subject,
        status: l.status,
        time: new Date(l.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        dkim: l.dkimSigned,
      }));


      stats.delivered = delivered + opened + clicked;
      stats.opened = opened + clicked;
      stats.clicked = clicked;
      stats.bounced = bounced;

      if (total > 0) {
        stats.deliveredRate = `${Math.round(((delivered + opened + clicked) / total) * 100)}%`;
        stats.openRate = `${Math.round(((opened + clicked) / total) * 100)}%`;
        stats.clickRate = `${Math.round((clicked / total) * 100)}%`;
        stats.bounceRate = `${Math.round((bounced / total) * 100)}%`;
      }
    }

    return NextResponse.json({
      authenticated: true,
      user,
      stats,
      recentEmails,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch user profile" }, { status: 500 });
  }
}
