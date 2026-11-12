
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";
import { getCurrentUser } from "@/lib/auth/session";
import { verifyEmailDeliverability } from "@/lib/email/verifier-engine";

export async function POST(req: NextRequest) {
  try {
    let workspaceId: string | null = null;
    let plan = "STARTER";

    // 1. Try workspace auth context (API Key or Session)
    const auth = await getAuthContext(req);
    if (auth) {
      workspaceId = auth.workspace.id;
      plan = auth.workspace.plan || "STARTER";
    } else {
      const user = await getCurrentUser(req);
      if (user) {
        const membership = await prisma.workspaceMember.findFirst({
          where: { userId: user.userId },
          include: { workspace: true },
        });
        if (membership) {
          workspaceId = membership.workspace.id;
          plan = membership.workspace.plan || "STARTER";
        }
      }
    }

    const body = await req.json().catch(() => ({}));
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Valid 'email' field is required in request body." },
        { status: 400 }
      );
    }

    // 2. Perform Real-time Multi-Tier Verification
    const report = await verifyEmailDeliverability(email);

    // 3. Return report with plan telemetry
    return NextResponse.json({
      success: true,
      email: report.email,
      verdict: report.verdict,
      riskScore: report.riskScore,
      reason: report.reason,
      details: report.details,
      planTier: plan,
      isDeliverable: report.verdict === "DELIVERABLE",
      timestamp: report.checkedAt,
    });
  } catch (error: any) {
    console.error("[VERIFY_API_ERROR]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify email deliverability." },
      { status: 500 }
    );
  }
}

