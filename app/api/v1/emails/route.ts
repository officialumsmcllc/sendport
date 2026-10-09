import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";

/**
 * GET /api/v1/emails
 * List emails sent by the authenticated workspace, strictly isolated.
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
    const domain = searchParams.get("domain")?.trim();
    const status = searchParams.get("status")?.trim();

    const where: any = { workspaceId: auth.workspace.id };
    if (domain && domain !== "ALL") {
      where.OR = [
        { domain: { name: { equals: domain, mode: "insensitive" } } },
        { from: { contains: domain, mode: "insensitive" } },
      ];
    }
    if (status && status !== "ALL") {
      where.status = status.toUpperCase();
    }

    const emails = await prisma.emailLog.findMany({
      where,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        domain: {
          select: { id: true, name: true, status: true },
        },
      },
    });

    return NextResponse.json({
      data: emails.map((e) => ({
        id: e.messageId,
        from: e.from,
        to: e.to.split(", "),
        subject: e.subject,
        status: e.status.toLowerCase(),
        domain: e.domain?.name || e.from.split("@")[1]?.replace(/[<>]/g, "").trim(),
        dkim_signed: e.dkimSigned,
        created_at: e.createdAt,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
