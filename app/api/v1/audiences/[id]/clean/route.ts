// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";
import { getCurrentUser } from "@/lib/auth/session";
import { verifyEmailDeliverability } from "@/lib/email/verifier-engine";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: audienceId } = await context.params;

    let workspaceId: string | null = null;
    let plan = "STARTER";

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

    if (!workspaceId) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    // Verify audience ownership
    const audience = await prisma.audience.findFirst({
      where: { id: audienceId, workspaceId },
    });

    if (!audience) {
      return NextResponse.json({ error: "Audience not found in your workspace." }, { status: 404 });
    }

    // Plan tier quotas for bulk cleaning
    const planLimits: Record<string, number> = {
      STARTER: 100,
      GROWTH: 5000,
      SCALE_PRO: 50000,
    };

    const maxAllowed = planLimits[plan] || 100;

    // Fetch active subscribed contacts
    const contacts = await prisma.contact.findMany({
      where: { audienceId, unsubscribed: false },
      select: { id: true, email: true },
      take: maxAllowed + 1,
    });

    if (contacts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active subscribed contacts to clean in this audience.",
        totalScanned: 0,
        cleanedCount: 0,
        validCount: 0,
      });
    }

    if (contacts.length > maxAllowed && plan === "STARTER") {
      return NextResponse.json(
        {
          error: `Plan limit reached: Your audience has ${contacts.length} contacts, but Starter plan includes 100 free verifications. Please upgrade to Growth (5,000/mo) or Scale Pro (50,000/mo) to clean large lists in 1 click.`,
          upgradeRequired: true,
        },
        { status: 403 }
      );
    }

    const contactsToVerify = contacts.slice(0, maxAllowed);
    let cleanedCount = 0;
    let validCount = 0;
    const deadContactIds: string[] = [];

    // Scan contacts with concurrency limit
    const batchSize = 10;
    for (let i = 0; i < contactsToVerify.length; i += batchSize) {
      const batch = contactsToVerify.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (c) => {
          try {
            const report = await verifyEmailDeliverability(c.email);
            if (report.verdict === "UNDELIVERABLE" || report.details.isDisposable) {
              deadContactIds.push(c.id);
              cleanedCount++;
            } else {
              validCount++;
            }
          } catch (_) {
            validCount++;
          }
        })
      );
    }

    // Mark dead contacts as unsubscribed so they never bounce campaigns
    if (deadContactIds.length > 0) {
      await prisma.contact.updateMany({
        where: { id: { in: deadContactIds } },
        data: { unsubscribed: true },
      });
    }

    return NextResponse.json({
      success: true,
      totalScanned: contactsToVerify.length,
      cleanedCount,
      validCount,
      message: `Audience cleaned! ${cleanedCount} dead/invalid mailboxes safely neutralized to protect your sender reputation.`,
    });
  } catch (error: any) {
    console.error("[AUDIENCE_CLEAN_ERROR]:", error);
    return NextResponse.json(
      { error: error.message || "Failed to clean audience contacts." },
      { status: 500 }
    );
  }
}
