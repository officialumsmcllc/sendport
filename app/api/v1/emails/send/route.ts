import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendEmailEngine } from "@/lib/email/dispatcher";
import { validateEmailWithMx } from "@/lib/email/validator";
import { getAuthContext } from "@/lib/auth/workspace-auth";

/**
 * POST /api/v1/emails/send
 * Authorization: Bearer sk_live_... (or authenticated browser session)
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized. Missing or invalid 'Authorization: Bearer sk_live_...' header or active session." },
        { status: 401 }
      );
    }

    const workspace = auth.workspace;

    // Daily Quota Enforcement
    if (workspace.usedToday >= workspace.dailyQuota) {
      return NextResponse.json(
        {
          error: `Daily email quota reached (${workspace.usedToday}/${workspace.dailyQuota}). Upgrade plan to send more.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { from, to, subject, html, text, reply_to, track_opens, track_clicks, headers, attachments } = body;

    if (!from || !to || !subject) {
      return NextResponse.json(
        { error: "Missing required parameters: 'from', 'to', and 'subject' are mandatory." },
        { status: 422 }
      );
    }

    // Pre-flight recipient syntax & DNS MX validation (prevents hard bounces and mailbox suspensions)
    const recipientList = Array.isArray(to) ? to : [to];
    for (const recipient of recipientList) {
      const val = await validateEmailWithMx(recipient);
      if (!val.isValid) {
        return NextResponse.json(
          { error: `Invalid recipient address '${recipient}': ${val.reason}` },
          { status: 422 }
        );
      }
    }

    // Check suppression list
    const suppressed = await prisma.suppression.findFirst({
      where: {
        workspaceId: workspace.id,
        email: recipientList[0].toLowerCase(),
      },
    });

    if (suppressed) {
      return NextResponse.json(
        {
          error: `Recipient '${recipientList[0]}' is in your Suppression List (${suppressed.reason}). Email was not sent.`,
        },
        { status: 422 }
      );
    }

    // Dispatch email
    const result = await sendEmailEngine({
      workspaceId: workspace.id,
      from,
      to: recipientList,
      subject,
      html,
      text,
      replyTo: reply_to,
      trackOpens: track_opens !== false,
      trackClicks: track_clicks !== false,
      headers,
      attachments,
    });

    // Real-time Quota Increment
    prisma.workspace
      .update({
        where: { id: workspace.id },
        data: {
          usedToday: { increment: recipientList.length },
        },
      })
      .catch((err) => console.error("Error updating workspace usedToday:", err));

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to dispatch email." },
      { status: 422 }
    );
  }
}
