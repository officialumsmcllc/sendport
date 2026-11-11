// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";
import { sendEmailEngine } from "@/lib/email/dispatcher";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const domainFilter = searchParams.get("domain") || "";

    const where: any = {
      workspaceId: auth.workspace.id,
      status: { in: ["BOUNCED", "FAILED"] },
    };

    if (domainFilter) {
      where.to = { contains: domainFilter, mode: "insensitive" };
    }

    const failedEmails = await prisma.emailLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        to: true,
        from: true,
        subject: true,
        status: true,
        bounceType: true,
        bounceReason: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: failedEmails.length,
      emails: failedEmails,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { emailId, allBounced, filterDomain } = body;

    let emailsToRetry: any[] = [];

    if (emailId) {
      const email = await prisma.emailLog.findFirst({
        where: {
          id: emailId,
          workspaceId: auth.workspace.id,
        },
      });
      if (email) emailsToRetry.push(email);
    } else if (allBounced) {
      const where: any = {
        workspaceId: auth.workspace.id,
        status: { in: ["BOUNCED", "FAILED"] },
      };
      if (filterDomain) {
        where.to = { contains: filterDomain, mode: "insensitive" };
      }
      emailsToRetry = await prisma.emailLog.findMany({
        where,
        take: 30, // Controlled safe batch
        orderBy: { createdAt: "desc" },
      });
    }

    if (emailsToRetry.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No bounced or failed emails found to retry.",
        retriedCount: 0,
        deliveredCount: 0,
        failedCount: 0,
      });
    }

    let deliveredCount = 0;
    let failedCount = 0;
    const results: any[] = [];

    for (const email of emailsToRetry) {
      try {
        // 1. Remove recipient from suppression table if present
        const recipientClean = email.to.toLowerCase().trim();
        await prisma.suppression.deleteMany({
          where: {
            workspaceId: email.workspaceId,
            email: recipientClean,
          },
        }).catch(() => {});

        // 2. Sanitize HTML body: strip any legacy unaligned tracking pixels that trigger Google 5.7.1 spam heuristics
        const sanitizedHtml = email.htmlBody
          ? email.htmlBody.replace(/<img[^>]*\/api\/track\/open\/[^>]*>/gi, "")
          : undefined;

        // 3. Re-dispatch via sendEmailEngine (100% Dedicated VPS MTA)
        const sendResult = await sendEmailEngine({
          workspaceId: email.workspaceId,
          from: email.from,
          to: email.to,
          subject: email.subject,
          html: sanitizedHtml,
          text: email.textBody || undefined,
        });

        if (sendResult.status === "delivered") {
          deliveredCount++;
          await prisma.emailLog.update({
            where: { id: email.id },
            data: {
              status: "DELIVERED",
              bounceType: null,
              bounceReason: null,
              updatedAt: new Date(),
            },
          });
          results.push({ id: email.id, to: email.to, status: "DELIVERED" });
        } else {
          failedCount++;
          await prisma.emailLog.update({
            where: { id: email.id },
            data: {
              status: "FAILED",
              bounceType: null,
              bounceReason: sendResult.error || "Delivery attempt failed",
              updatedAt: new Date(),
            },
          });
          results.push({ id: email.id, to: email.to, status: "FAILED", error: sendResult.error });
        }
      } catch (err: any) {
        failedCount++;
        results.push({ id: email.id, to: email.to, status: "ERROR", error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      retriedCount: emailsToRetry.length,
      deliveredCount,
      failedCount,
      results,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

