import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { ensureDbSchema } from "@/lib/db/ensure-schema";

export async function POST(req: NextRequest) {
  try {
    await ensureDbSchema();
    const session = await getCurrentUser();

    if (!session || !session.userId) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in or create an account first." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const rawCode = body.code ? String(body.code).trim().toUpperCase() : "";

    if (!rawCode) {
      return NextResponse.json(
        { error: "Please enter a valid AppSumo redemption code." },
        { status: 400 }
      );
    }

    if (rawCode.length < 8) {
      return NextResponse.json(
        { error: "Invalid code format. Codes typically look like SP-LTD-XXXX-XXXX-XXXX." },
        { status: 400 }
      );
    }

    const existingRedemption: any[] = await prisma.$queryRawUnsafe(
      'SELECT * FROM "AppSumoRedemption" WHERE "code" = $1 LIMIT 1',
      rawCode
    );

    if (existingRedemption && existingRedemption.length > 0) {
      return NextResponse.json(
        { error: "This AppSumo code has already been redeemed." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        workspaces: {
          include: {
            workspace: true,
          },
        },
      },
    });

    if (!user || !user.workspaces || user.workspaces.length === 0) {
      return NextResponse.json(
        { error: "No active workspace found for your account." },
        { status: 404 }
      );
    }

    const currentWorkspace = user.workspaces[0].workspace;

    const previousRedemptions: any[] = await prisma.$queryRawUnsafe(
      'SELECT * FROM "AppSumoRedemption" WHERE "workspaceId" = $1',
      currentWorkspace.id
    );

    const stackedCount = (previousRedemptions ? previousRedemptions.length : 0) + 1;

    if (stackedCount > 3) {
      return NextResponse.json(
        { error: "Maximum of 3 codes can be stacked per workspace." },
        { status: 400 }
      );
    }

    let newPlan = "APPSUMO_TIER_1";
    let newQuota = 100;

    if (stackedCount === 2) {
      newPlan = "APPSUMO_TIER_2";
      newQuota = 3000;
    } else if (stackedCount >= 3) {
      newPlan = "APPSUMO_TIER_3";
      newQuota = 25000;
    }

    const redemptionId = "red_" + Math.random().toString(36).substring(2, 12);
    await prisma.$executeRawUnsafe(
      'INSERT INTO "AppSumoRedemption" ("id", "code", "tier", "userId", "workspaceId", "redeemedAt") VALUES ($1, $2, $3, $4, $5, NOW())',
      redemptionId,
      rawCode,
      stackedCount,
      session.userId,
      currentWorkspace.id
    );

    await prisma.workspace.update({
      where: { id: currentWorkspace.id },
      data: {
        plan: newPlan,
        dailyQuota: newQuota,
        planExpiresAt: null,
        isPlanExpired: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Congratulations! Code successfully activated. Your account is now upgraded to AppSumo Tier ${stackedCount}.`,
      tier: stackedCount,
      plan: newPlan,
      dailyQuota: newQuota,
    });
  } catch (error: any) {
    console.error("[APPSUMO REDEMPTION ERROR]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process redemption. Please try again." },
      { status: 500 }
    );
  }
}
