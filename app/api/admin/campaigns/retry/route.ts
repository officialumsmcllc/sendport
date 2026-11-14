
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";
import { sendEmailEngine } from "@/lib/email/dispatcher";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { blastId } = body;

    if (!blastId) {
      return NextResponse.json(
        { error: "Campaign Blast ID is required." },
        { status: 400 }
      );
    }

    // 1. Fetch the broadcast blast record
    const blast = await prisma.broadcastBlast.findUnique({
      where: { id: blastId },
    });

    if (!blast) {
      return NextResponse.json(
        { error: "Campaign blast record not found." },
        { status: 404 }
      );
    }

    // 2. Fetch contacts for this audience
    const contacts = await prisma.contact.findMany({
      where: { audienceId: blast.audienceId, unsubscribed: false },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    if (contacts.length === 0) {
      return NextResponse.json(
        { error: "Audience list contains 0 active subscribed contacts." },
        { status: 400 }
      );
    }

    // 3. Mark blast as actively SENDING with progress reset
    await prisma.broadcastBlast.update({
      where: { id: blastId },
      data: {
        status: "SENDING",
        sentCount: 0,
        failedCount: 0,
        totalRecipients: contacts.length,
      },
    });

    // 4. Background Asynchronous Execution Queue (Non-blocking response)
    (async () => {
      let currentSent = 0;
      let currentFailed = 0;
      const batchSize = 10;
      const fromAddress = blast.fromName
        ? `${blast.fromName} <${blast.fromEmail}>`
        : blast.fromEmail;

      for (let i = 0; i < contacts.length; i++) {
        // Check if blast was stopped by admin during processing
        if (i % 5 === 0) {
          const currentBlastState = await prisma.broadcastBlast.findUnique({
            where: { id: blastId },
            select: { status: true },
          });
          if (currentBlastState?.status === "STOPPED" || currentBlastState?.status === "CANCELLED") {
            console.log(`[CAMPAIGN ABORTED] Blast ${blastId} was manually stopped by admin.`);
            break;
          }
        }

        const contact = contacts[i];
        try {
          // Strip legacy unaligned tracking pixels that trigger Google 5.7.1 spam heuristics
          const sanitizedHtml = (blast.htmlContent || "")
            .replace(/<img[^>]*\/api\/track\/open\/[^>]*>/gi, "")
            .replace(/\{\{\s*first_name\s*\}\}/gi, contact.firstName || "")
            .replace(/\{\{\s*last_name\s*\}\}/gi, contact.lastName || "")
            .replace(/\{\{\s*email\s*\}\}/gi, contact.email);

          const result = await sendEmailEngine({
            workspaceId: blast.workspaceId,
            from: fromAddress,
            to: [contact.email],
            subject: blast.subject,
            html: sanitizedHtml,
            headers: {
              Precedence: "bulk",
              "List-Unsubscribe": `<mailto:unsubscribe@${blast.fromEmail.split("@").pop()}?subject=unsubscribe>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
          });

          if (result && result.status === "delivered") {
            currentSent++;
          } else {
            currentFailed++;
          }
        } catch (err) {
          console.error(`[CAMPAIGN RESEND ERR] ${contact.email}:`, err);
          currentFailed++;
        }

        // Periodically sync live progress to DB every 5 contacts
        if (i % 5 === 0 || i === contacts.length - 1) {
          await prisma.broadcastBlast.update({
            where: { id: blastId },
            data: {
              sentCount: currentSent,
              failedCount: currentFailed,
            },
          }).catch(() => {});
        }

        // Anti-Throttle Pacing: Yahoo, Hotmail, and Gmail require 600-800ms between direct SMTP connections
        const recipientDomain = contact.email.split("@")[1]?.toLowerCase() || "";
        const isStrictThrottleMx =
          recipientDomain.includes("yahoo") ||
          recipientDomain.includes("aol") ||
          recipientDomain.includes("hotmail") ||
          recipientDomain.includes("outlook") ||
          recipientDomain.includes("live");

        const delayMs = isStrictThrottleMx ? 750 : 150;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }

      // Final status update
      await prisma.broadcastBlast.update({
        where: { id: blastId },
        data: {
          sentCount: currentSent,
          failedCount: currentFailed,
          status: currentFailed === 0 ? "COMPLETED" : currentSent > 0 ? "PARTIAL" : "FAILED",
        },
      }).catch(() => {});
    })();

    return NextResponse.json({
      success: true,
      message: `Campaign resend initiated! Dispatching to ${contacts.length} recipients over Autonomous Port 25 MTA.`,
      blastId,
      totalRecipients: contacts.length,
    });
  } catch (error: any) {
    console.error("[CAMPAIGN RETRY ERROR]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
