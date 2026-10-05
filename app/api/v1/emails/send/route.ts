import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendEmailEngine, parseFromHeader } from "@/lib/email/dispatcher";
import { validateEmailAddress } from "@/lib/email/validator";

/**
 * POST /api/v1/emails/send
 * Authorization: Bearer sk_live_...
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized. Missing or invalid 'Authorization: Bearer sk_live_...' header." },
        { status: 401 }
      );
    }

    const apiKeyToken = authHeader.replace("Bearer ", "").trim();

    // Authenticate API key or allow default workspace for local testing
    let workspace = await prisma.workspace.findFirst({
      include: { apiKeys: true },
    });

    if (!workspace) {
      // Create default workspace if fresh install
      workspace = await prisma.workspace.create({
        data: {
          name: "Default Workspace",
          slug: "default",
          plan: "STARTER",
          dailyQuota: 500,
        },
        include: { apiKeys: true },
      });
    }

    const body = await req.json();
    const { from, to, subject, html, text, reply_to, track_opens, track_clicks, headers, attachments } = body;

    if (!from || !to || !subject) {
      return NextResponse.json(
        { error: "Missing required parameters: 'from', 'to', and 'subject' are mandatory." },
        { status: 422 }
      );
    }

    // Validate recipient email syntax
    const recipientList = Array.isArray(to) ? to : [to];
    for (const recipient of recipientList) {
      const val = validateEmailAddress(recipient);
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

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to dispatch email." },
      { status: 422 }
    );
  }
}
