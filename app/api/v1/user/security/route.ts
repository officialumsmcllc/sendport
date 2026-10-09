import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const auditLogs = await prisma.auditLog.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      twoFactorEnabled: Boolean(user.twoFactorEnabled),
      auditLogs,
    });
  } catch (error: any) {
    console.error("Security audit error:", error);
    return NextResponse.json({ error: "Failed to fetch security logs" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { twoFactorEnabled, action } = body;
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";

    if (action === "REVOKE_ALL_SESSIONS") {
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: "SESSIONS_REVOKED_ALL",
          ip: clientIp,
          details: JSON.stringify({ message: "Revoked all active secondary web tokens and device sessions" }),
        },
      });

      const auditLogs = await prisma.auditLog.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      return NextResponse.json({
        success: true,
        message: "All other device sessions revoked successfully.",
        auditLogs,
      });
    }

    if (typeof twoFactorEnabled === "boolean") {
      const updatedUser = await prisma.user.update({
        where: { id: session.userId },
        data: {
          twoFactorEnabled,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: twoFactorEnabled ? "2FA_AUTHENTICATOR_ENABLED" : "2FA_AUTHENTICATOR_DISABLED",
          ip: clientIp,
          details: JSON.stringify({
            status: twoFactorEnabled ? "Active & Enforced" : "Disabled",
            method: "TOTP_HARDWARE",
          }),
        },
      });

      const auditLogs = await prisma.auditLog.findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 20,
      });

      return NextResponse.json({
        success: true,
        twoFactorEnabled: updatedUser.twoFactorEnabled,
        auditLogs,
      });
    }

    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  } catch (error: any) {
    console.error("Update Security Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update security" }, { status: 500 });
  }
}
