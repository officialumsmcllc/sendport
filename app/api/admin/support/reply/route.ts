import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { sendEmailEngine } from "@/lib/email/dispatcher";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied. Administrator privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { ticketId, replyText, adminName } = body;

    if (!ticketId || !replyText?.trim()) {
      return NextResponse.json(
        { error: "Both 'ticketId' and 'replyText' are mandatory." },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Support ticket not found." }, { status: 404 });
    }

    // Find the Admin user's workspace to authorize @getsendport.com dispatch
    let workspace = await prisma.workspace.findFirst({
      where: {
        members: {
          some: {
            userId: session.userId,
          },
        },
      },
    });

    if (!workspace) {
      // Fallback: any admin workspace
      workspace = await prisma.workspace.findFirst({
        where: {
          members: {
            some: {
              user: { role: "ADMIN" },
            },
          },
        },
      });
    }

    // Construct high-deliverability branded HTML email
    const responderName = adminName?.trim() || session.name || "Sendport Engineering Support";
    const formattedReplyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Response to your Sendport Support Ticket [#${ticket.ticketNumber}]</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #f1f5f9; padding: 32px 16px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
    
    <!-- Header -->
    <div style="padding: 24px 32px; background: linear-gradient(135deg, #090d16 0%, #1e293b 100%); border-bottom: 1px solid #334155;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td>
            <span style="font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">Sendport</span>
            <span style="display: block; font-size: 11px; color: #38bdf8; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">Official Support</span>
          </td>
          <td align="right">
            <span style="background-color: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; font-family: monospace; font-size: 12px; padding: 4px 10px; border-radius: 8px;">
              ${ticket.ticketNumber}
            </span>
          </td>
        </tr>
      </table>
    </div>

    <!-- Body Content -->
    <div style="padding: 32px; color: #e2e8f0; line-height: 1.6; font-size: 14px;">
      <p style="margin-top: 0; color: #94a3b8; font-size: 13px;">
        Hello ${ticket.name || "there"},
      </p>

      <div style="margin: 20px 0; color: #f8fafc; font-size: 14px; white-space: pre-wrap; line-height: 1.7;">
${replyText.trim()}
      </div>

      <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #1e293b;">
        <p style="margin: 0; font-size: 13px; font-weight: 600; color: #ffffff;">${responderName}</p>
        <p style="margin: 2px 0 0 0; font-size: 12px; color: #38bdf8;">Sendport Infrastructure & Deliverability Team</p>
        <p style="margin: 4px 0 0 0; font-size: 11px; color: #64748b;">getsendport.com &bull; support@getsendport.com</p>
      </div>

      <!-- Original Message Reference -->
      <div style="margin-top: 28px; background-color: #020617; border-left: 3px solid #38bdf8; border-radius: 4px; padding: 14px 16px;">
        <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px;">Your Original Inquiry:</p>
        <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 600; color: #cbd5e1;">Topic: ${ticket.subject}</p>
        <p style="margin: 0; font-size: 12px; color: #94a3b8; white-space: pre-wrap; line-height: 1.5;">${ticket.message}</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="padding: 16px 32px; background-color: #020617; border-top: 1px solid #1e293b; text-align: center;">
      <p style="margin: 0; font-size: 11px; color: #64748b;">
        Secured with 2048-bit RSA DKIM &bull; Delivered via Sendport High-Throughput Delivery Engine
      </p>
    </div>

  </div>
</body>
</html>
`;

    let emailDelivered = false;
    let deliveryMessageId: string | undefined;
    let deliveryError: string | undefined;

    if (workspace) {
      try {
        const result = await sendEmailEngine({
          workspaceId: workspace.id,
          from: "Sendport Support <support@getsendport.com>",
          to: ticket.email,
          subject: `Re: ${ticket.subject} [${ticket.ticketNumber}]`,
          html: formattedReplyHtml,
          text: `${replyText}\n\n---\nOriginal Message (${ticket.ticketNumber}):\n${ticket.message}`,
          replyTo: "support@getsendport.com",
        });
        emailDelivered = true;
        deliveryMessageId = result.id;
      } catch (err: any) {
        console.error("[SUPPORT_REPLY_DISPATCH_WARNING]", err);
        deliveryError = err.message || "Failed to dispatch email directly via MX.";
      }
    } else {
      deliveryError = "No active administrator workspace found to dispatch official email.";
    }

    // Update SupportTicket in database
    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        status: "REPLIED",
        replyText: replyText.trim(),
        repliedAt: new Date(),
        repliedBy: responderName,
      },
    });

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
      emailDelivered,
      deliveryMessageId,
      deliveryWarning: deliveryError ? `Reply saved in database. Email dispatch notice: ${deliveryError}` : undefined,
    });
  } catch (error: any) {
    console.error("[ADMIN_SUPPORT_REPLY_ERROR]", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit reply." },
      { status: 500 }
    );
  }
}
