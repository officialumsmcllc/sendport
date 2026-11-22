import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendPlanExpiryWarningEmail, sendSubscriptionExpiredEmail } from "@/lib/email/system-mailer";

export const dynamic = "force-dynamic";

/**
 * Daily Automated Subscription Expiry & Reminder Cron Job
 * Route: /api/cron/subscriptions
 * Can be called by Vercel Cron, Render Cron, or External Webhook (e.g. cron-job.org)
 */
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "sendport_cron_secret_2026";

    // Optional secret check if set
    if (authHeader && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // 1. Find all paid workspaces with expiration dates
    const workspaces = await prisma.workspace.findMany({
      where: {
        plan: { in: ["GROWTH", "SCALE_PRO"] },
        planExpiresAt: { not: null },
      },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    const results: Array<{ workspace: string; email: string; action: string }> = [];

    for (const ws of workspaces) {
      if (!ws.planExpiresAt) continue;

      const expiresAt = new Date(ws.planExpiresAt);
      const isExpired = expiresAt.getTime() <= now.getTime();
      const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Get primary owner email
      const primaryUser = ws.members[0]?.user;
      if (!primaryUser?.email) continue;

      if (isExpired) {
        // Mark workspace as expired in DB
        await prisma.workspace.update({
          where: { id: ws.id },
          data: { isPlanExpired: true },
        }).catch(() => {});

        // Send Expired Notice Email
        await sendSubscriptionExpiredEmail(
          { email: primaryUser.email, name: primaryUser.name },
          ws.plan
        );

        results.push({
          workspace: ws.name,
          email: primaryUser.email,
          action: "EXPIRED_NOTICE_SENT",
        });
      } else if (daysLeft <= 3 && daysLeft > 0) {
        // Send Warning Reminder (e.g. 3 days left or 1 day left)
        await sendPlanExpiryWarningEmail(
          { email: primaryUser.email, name: primaryUser.name },
          ws.plan,
          daysLeft
        );

        results.push({
          workspace: ws.name,
          email: primaryUser.email,
          action: `REMINDER_SENT_${daysLeft}_DAYS_LEFT`,
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: workspaces.length,
      actions: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[CRON_SUBSCRIPTIONS_ERROR]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
