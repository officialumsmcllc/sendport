import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { logSecurityAudit } from "@/lib/security/audit";

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const domains = await prisma.domain.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        workspace: {
          select: { id: true, name: true, plan: true },
        },
        user: {
          select: { id: true, email: true, name: true },
        },
        _count: {
          select: { emails: true },
        },
      },
    });

    const totalDomains = domains.length;
    const verifiedDomains = domains.filter((d) => d.status === "VERIFIED").length;
    const pendingDomains = domains.filter((d) => d.status === "PENDING").length;
    const failedDomains = domains.filter((d) => d.status === "FAILED").length;

    return NextResponse.json({
      success: true,
      domains,
      stats: {
        totalDomains,
        verifiedDomains,
        pendingDomains,
        failedDomains,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { domainId, status, forceVerify } = body;

    if (!domainId) {
      return NextResponse.json({ error: "Domain ID is required" }, { status: 400 });
    }

    let updateData: any = {};
    if (forceVerify) {
      updateData = {
        status: "VERIFIED",
        isDkimValid: true,
        isSpfValid: true,
        isDmarcValid: true,
        isMxValid: true,
        verifiedAt: new Date(),
      };
    } else if (status) {
      updateData = { status };
    }

    const updated = await prisma.domain.update({
      where: { id: domainId },
      data: updateData,
    });

    logSecurityAudit("ADMIN_DOMAIN_OVERRIDE", session.userId, { domainId, updateData });

    return NextResponse.json({
      success: true,
      message: `Domain ${updated.name} updated successfully.`,
      domain: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
