import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";
import { sendEmailEngine } from "@/lib/email/dispatcher";

async function ensureBroadcastTable() {
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "BroadcastBlast" (
        "id" TEXT NOT NULL,
        "workspaceId" TEXT NOT NULL,
        "audienceId" TEXT NOT NULL,
        "subject" TEXT NOT NULL,
        "fromName" TEXT,
        "fromEmail" TEXT NOT NULL,
        "htmlContent" TEXT NOT NULL,
        "totalRecipients" INTEGER NOT NULL DEFAULT 0,
        "sentCount" INTEGER NOT NULL DEFAULT 0,
        "failedCount" INTEGER NOT NULL DEFAULT 0,
        "status" TEXT NOT NULL DEFAULT 'COMPLETED',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "BroadcastBlast_pkey" PRIMARY KEY ("id")
      );
    `);
  } catch (e) {
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "BroadcastBlast" (
          id TEXT PRIMARY KEY,
          workspaceId TEXT,
          audienceId TEXT,
          subject TEXT,
          fromName TEXT,
          fromEmail TEXT,
          htmlContent TEXT,
          totalRecipients INTEGER DEFAULT 0,
          sentCount INTEGER DEFAULT 0,
          failedCount INTEGER DEFAULT 0,
          status TEXT DEFAULT 'COMPLETED',
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (e2) {}
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureBroadcastTable();

    const history = await prisma.broadcastBlast.findMany({
      where: { workspaceId: auth.workspace.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ history });
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

    await ensureBroadcastTable();

    const body = await req.json();
    const { audienceId, subject, fromName, fromEmail, htmlContent, replyTo } = body;

    if (!audienceId || !subject || !fromEmail || !htmlContent) {
      return NextResponse.json(
        { error: "Audience, Subject, Sender Email, and HTML Content are required." },
        { status: 422 }
      );
    }

    // Verify audience belongs to workspace
    const audience = await prisma.audience.findFirst({
      where: { id: audienceId, workspaceId: auth.workspace.id },
    });

    if (!audience) {
      return NextResponse.json({ error: "Audience not found in your workspace." }, { status: 404 });
    }

    // Fetch active subscribed contacts
    const activeContacts = await prisma.contact.findMany({
      where: { audienceId, unsubscribed: false },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (activeContacts.length === 0) {
      return NextResponse.json(
        { error: "This audience has 0 active subscribed contacts." },
        { status: 400 }
      );
    }

    // Check quota
    const quotaRemaining = Math.max(0, auth.workspace.dailyQuota - auth.workspace.usedToday);
    if (activeContacts.length > quotaRemaining) {
      return NextResponse.json(
        {
          error: `Daily quota limit: This list has ${activeContacts.length} subscribers, but you only have ${quotaRemaining} emails remaining today on your ${auth.workspace.plan} plan. Please upgrade to Growth or Scale Pro.`,
        },
        { status: 429 }
      );
    }

    const fromAddress = fromName ? `${fromName} <${fromEmail}>` : fromEmail;
    let sentCount = 0;
    let failedCount = 0;

    // Send emails in batches of 10
    const batchSize = 10;
    for (let i = 0; i < activeContacts.length; i += batchSize) {
      const batch = activeContacts.slice(i, i + batchSize);
      await Promise.all(
        batch.map(async (contact) => {
          try {
            // Personalized tags replacement
            const personalizedHtml = htmlContent
              .replace(/\{\{\s*first_name\s*\}\}/gi, contact.firstName || "")
              .replace(/\{\{\s*last_name\s*\}\}/gi, contact.lastName || "")
              .replace(/\{\{\s*email\s*\}\}/gi, contact.email);

            await sendEmailEngine({
              workspaceId: auth.workspace.id,
              from: fromAddress,
              to: [contact.email],
              subject,
              html: personalizedHtml,
              replyTo: replyTo || undefined,
            });
            sentCount++;
          } catch (err) {
            console.error(`Broadcast failed to ${contact.email}:`, err);
            failedCount++;
          }
        })
      );
    }

    // Update workspace quota
    await prisma.workspace.update({
      where: { id: auth.workspace.id },
      data: {
        usedToday: { increment: sentCount },
      },
    });

    // Record Broadcast History
    const blast = await prisma.broadcastBlast.create({
      data: {
        workspaceId: auth.workspace.id,
        audienceId,
        subject,
        fromName: fromName || null,
        fromEmail,
        htmlContent,
        totalRecipients: activeContacts.length,
        sentCount,
        failedCount,
        status: failedCount === 0 ? "COMPLETED" : "PARTIAL",
      },
    });

    return NextResponse.json({
      success: true,
      message: `Broadcast dispatched! ${sentCount} emails sent successfully.`,
      blastId: blast.id,
      totalRecipients: activeContacts.length,
      sentCount,
      failedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
