import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Missing or invalid Authorization header" },
        { status: 401 }
      );
    }

    const apiKeyRaw = authHeader.replace("Bearer ", "").trim();
    const apiKey = await prisma.apiKey.findFirst({
      where: {
        OR: [
          { keyHash: apiKeyRaw },
          { keyPrefix: { startsWith: apiKeyRaw.substring(0, 12) } },
        ],
      },
      include: {
        workspace: {
          include: {
            domains: true,
            audiences: {
              include: {
                _count: {
                  select: { contacts: true },
                },
              },
            },
          },
        },
      },
    });

    if (!apiKey) {
      return NextResponse.json(
        { error: "Forbidden", message: "Invalid API Key" },
        { status: 403 }
      );
    }

    const workspace = apiKey.workspace;
    const remainingToday = Math.max(0, workspace.dailyQuota - workspace.usedToday);
    const totalContacts = workspace.audiences.reduce(
      (sum, aud) => sum + (aud._count?.contacts || 0),
      0
    );

    return NextResponse.json({
      object: "account_usage",
      workspace_id: workspace.id,
      workspace_name: workspace.name,
      plan: workspace.plan,
      daily_quota: workspace.dailyQuota,
      used_today: workspace.usedToday,
      remaining_today: remainingToday,
      quota_reset_at: workspace.quotaResetAt,
      verified_domains_count: workspace.domains.filter((d) => d.status === "VERIFIED").length,
      total_domains_count: workspace.domains.length,
      audiences_count: workspace.audiences.length,
      total_contacts_count: totalContacts,
    });
  } catch (error: any) {
    console.error("Usage API Error:", error);
    return NextResponse.json(
      { error: "InternalServerError", message: error.message },
      { status: 500 }
    );
  }
}
