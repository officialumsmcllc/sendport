import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const emailLog = await prisma.emailLog.findUnique({
      where: { openToken: token },
    });

    if (emailLog) {
      const recipient = emailLog.to.split(", ")[0].toLowerCase();
      await prisma.suppression.upsert({
        where: {
          workspaceId_email: {
            workspaceId: emailLog.workspaceId,
            email: recipient,
          },
        },
        update: { reason: "UNSUBSCRIBE" },
        create: {
          workspaceId: emailLog.workspaceId,
          email: recipient,
          reason: "UNSUBSCRIBE",
        },
      });
    }

    return new NextResponse(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribed — Sendport</title>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f8fafc; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; padding: 20px; }
            .card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 32px; max-width: 440px; text-align: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            h1 { color: #0f172a; font-size: 20px; margin-bottom: 8px; }
            p { color: #64748b; font-size: 14px; line-height: 1.5; }
            .badge { background: #dcfce7; color: #15803d; font-weight: 600; padding: 4px 12px; border-radius: 9999px; display: inline-block; font-size: 13px; margin-bottom: 16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <span class="badge">Unsubscribed</span>
            <h1>You have been successfully removed</h1>
            <p>Your email address has been added to the suppression list. You will no longer receive transactional emails from this sender.</p>
          </div>
        </body>
      </html>`,
      {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    );
  } catch (error) {
    return NextResponse.json({ error: "Failed to process unsubscribe request" }, { status: 500 });
  }
}
