import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendEmailEngine, parseFromHeader } from "@/lib/email/dispatcher";
import { validateEmailAddress } from "@/lib/email/validator";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * POST /api/v1/emails/send
 * Authorization: Bearer sk_live_... (or authenticated browser session)
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
    let workspace: any = null;
    let userId: string | null = null;

    // 1. Check API Key Header if present
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const apiKeyToken = authHeader.replace("Bearer ", "").trim();
      if (apiKeyToken && apiKeyToken !== "undefined" && apiKeyToken !== "null") {
        const apiKey = await prisma.apiKey.findFirst({
          where: {
            OR: [
              { keyHash: apiKeyToken },
              { keyPrefix: { startsWith: apiKeyToken.substring(0, 12) } },
            ],
          },
          include: {
            workspace: {
              include: { apiKeys: true, domains: true },
            },
          },
        });

        if (apiKey?.workspace) {
          workspace = apiKey.workspace;
          userId = apiKey.userId;
        }
      }
    }

    // 2. Fallback to Browser Session if request came from logged-in Dashboard/Playground
    if (!workspace) {
      const session = await getCurrentUser();
      if (session) {
        const user = await prisma.user.findUnique({
          where: { id: session.userId },
          include: {
            workspaces: {
              include: {
                workspace: {
                  include: { apiKeys: true, domains: true },
                },
              },
            },
          },
        });

        workspace = user?.workspaces?.[0]?.workspace;
        userId = session.userId;
      }
    }

    // 3. Fallback for fresh local setup / default workspace if none found
    if (!workspace) {
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
          { error: "Unauthorized. Missing or invalid 'Authorization: Bearer sk_live_...' header or active session." },
          { status: 401 }
        );
      }

      workspace = await prisma.workspace.findFirst({
        include: { apiKeys: true, domains: true },
      });

      if (!workspace) {
        workspace = await prisma.workspace.create({
          data: {
            name: "Default Workspace",
            slug: "default",
            plan: "STARTER",
            dailyQuota: 500,
          },
          include: { apiKeys: true, domains: true },
        });
      }
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
