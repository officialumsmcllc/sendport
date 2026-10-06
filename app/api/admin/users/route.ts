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

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        twoFactorEnabled: true,
        createdAt: true,
        workspaces: {
          include: {
            workspace: {
              select: {
                id: true,
                name: true,
                plan: true,
                dailyQuota: true,
                usedToday: true,
              },
            },
          },
        },
        _count: {
          select: {
            domains: true,
            apiKeys: true,
            payments: true,
          },
        },
      },
    });

    const totalUsers = users.length;
    const totalAdmins = users.filter((u) => u.role === "ADMIN").length;
    const activeWorkspacesCount = await prisma.workspace.count();

    return NextResponse.json({
      users,
      stats: {
        totalUsers,
        totalAdmins,
        activeWorkspacesCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
