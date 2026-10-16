import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const logs = await prisma.emailLog.findMany({
      take: limit,
      where,
      orderBy: { createdAt: "desc" },
      include: {
        workspace: {
          select: { id: true, name: true, plan: true },
        },
        domain: {
          select: { id: true, name: true },
        },
      },
    });

    const totalCount = await prisma.emailLog.count();
    const deliveredCount = await prisma.emailLog.count({
      where: { status: { in: ["DELIVERED", "OPENED", "CLICKED"] } },
    });
    const bouncedCount = await prisma.emailLog.count({ where: { status: "BOUNCED" } });
    const failedCount = await prisma.emailLog.count({ where: { status: "FAILED" } });

    return NextResponse.json({
      success: true,
      logs,
      stats: {
        totalCount,
        deliveredCount,
        bouncedCount,
        failedCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
