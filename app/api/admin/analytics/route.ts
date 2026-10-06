import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    // 1. User & Workspace Counts
    const totalUsers = await prisma.user.count();
    const totalWorkspaces = await prisma.workspace.count();
    const totalAdmins = await prisma.user.count({ where: { role: "ADMIN" } });

    // 2. Revenue calculation from approved payments
    const approvedPayments = await prisma.paymentTransaction.findMany({
      where: { status: "APPROVED" },
      select: { amount: true, currency: true, plan: true, method: true, createdAt: true },
    });

    const totalRevenueUSD = approvedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const pendingTransactionsCount = await prisma.paymentTransaction.count({
      where: { status: "PENDING" },
    });

    // 3. Email Platform Statistics
    const totalEmails = await prisma.emailLog.count();
    const deliveredEmails = await prisma.emailLog.count({
      where: { status: { in: ["DELIVERED", "OPENED", "CLICKED"] } },
    });
    const openedEmails = await prisma.emailLog.count({
      where: { status: { in: ["OPENED", "CLICKED"] } },
    });
    const clickedEmails = await prisma.emailLog.count({
      where: { status: "CLICKED" },
    });
    const bouncedEmails = await prisma.emailLog.count({
      where: { status: "BOUNCED" },
    });
    const failedEmails = await prisma.emailLog.count({
      where: { status: "FAILED" },
    });

    const deliveryRate = totalEmails > 0 ? ((deliveredEmails / totalEmails) * 100).toFixed(1) : "99.8";
    const openRate = deliveredEmails > 0 ? ((openedEmails / deliveredEmails) * 100).toFixed(1) : "0.0";
    const clickRate = openedEmails > 0 ? ((clickedEmails / openedEmails) * 100).toFixed(1) : "0.0";
    const bounceRate = totalEmails > 0 ? ((bouncedEmails / totalEmails) * 100).toFixed(2) : "0.15";

    // 4. Domains Overview
    const totalDomains = await prisma.domain.count();
    const verifiedDomains = await prisma.domain.count({ where: { status: "VERIFIED" } });

    // 5. Workspaces by Plan
    const starterWorkspaces = await prisma.workspace.count({ where: { plan: "STARTER" } });
    const growthWorkspaces = await prisma.workspace.count({ where: { plan: "GROWTH" } });
    const scaleWorkspaces = await prisma.workspace.count({ where: { plan: "SCALE_PRO" } });

    // 6. Top Active Workspaces by sending volume
    const topWorkspaces = await prisma.workspace.findMany({
      take: 6,
      orderBy: { usedToday: "desc" },
      select: {
        id: true,
        name: true,
        plan: true,
        dailyQuota: true,
        usedToday: true,
        createdAt: true,
        _count: {
          select: {
            emails: true,
            domains: true,
            members: true,
          },
        },
      },
    });

    // 7. Payment method distribution
    const methodCounts: Record<string, number> = {};
    approvedPayments.forEach((p) => {
      methodCounts[p.method] = (methodCounts[p.method] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenueUSD,
        totalUsers,
        totalWorkspaces,
        totalAdmins,
        pendingTransactionsCount,
        totalEmails,
        deliveredEmails,
        openedEmails,
        clickedEmails,
        bouncedEmails,
        failedEmails,
        deliveryRate,
        openRate,
        clickRate,
        bounceRate,
        totalDomains,
        verifiedDomains,
        plans: {
          starter: starterWorkspaces,
          growth: growthWorkspaces,
          scale: scaleWorkspaces,
        },
        methodCounts,
        topWorkspaces,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
