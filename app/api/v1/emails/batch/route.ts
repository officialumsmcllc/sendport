import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendEmailEngine } from "@/lib/email/dispatcher";
import { getAuthContext } from "@/lib/auth/workspace-auth";

/**
 * POST /api/v1/emails/batch
 * Send up to 1,000 distinct personalized emails in one call
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json(
        { error: "Unauthorized. Missing or invalid 'Authorization: Bearer sk_live_...' header." },
        { status: 401 }
      );
    }

    const workspace = auth.workspace;

    const body = await req.json();
    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "Batch payload must be a JSON array of email objects." },
        { status: 422 }
      );
    }

    if (body.length > 1000) {
      return NextResponse.json(
        { error: "Maximum batch limit exceeded. Send up to 1,000 emails per batch." },
        { status: 422 }
      );
    }

    if (workspace.usedToday + body.length > workspace.dailyQuota) {
      return NextResponse.json(
        {
          error: `Daily email quota would be exceeded (${workspace.usedToday}/${workspace.dailyQuota}). Batch requires ${body.length} sends. Upgrade your plan at /dashboard/billing to increase limits.`,
        },
        { status: 429 }
      );
    }

    const results = [];
    for (const item of body) {
      try {
        const res = await sendEmailEngine({
          workspaceId: workspace.id,
          from: item.from,
          to: item.to,
          subject: item.subject,
          html: item.html,
          text: item.text,
          trackOpens: item.track_opens !== false,
          trackClicks: item.track_clicks !== false,
        });
        results.push(res);
      } catch (err: any) {
        results.push({
          from: item.from,
          to: item.to,
          status: "failed",
          error: err.message,
        });
      }
    }

    return NextResponse.json({ data: results }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
