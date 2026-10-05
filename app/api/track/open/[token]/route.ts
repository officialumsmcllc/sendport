import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { dispatchWebhookEvents } from "@/lib/webhooks/dispatcher";

// 1x1 transparent GIF hex buffer
const TRANSPARENT_GIF_BUFFER = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

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
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          openCount: { increment: 1 },
          status: emailLog.status === "CLICKED" ? "CLICKED" : "OPENED",
        },
      });

      const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
      const userAgent = req.headers.get("user-agent");

      await prisma.trackingEvent.create({
        data: {
          emailLogId: emailLog.id,
          type: "OPEN",
          ip: ip || null,
          userAgent: userAgent || null,
        },
      });

      // Trigger webhook event
      dispatchWebhookEvents(emailLog.workspaceId, "email.opened", {
        id: emailLog.messageId,
        from: emailLog.from,
        to: emailLog.to,
        subject: emailLog.subject,
        created_at: new Date().toISOString(),
      });
    }

    return new NextResponse(TRANSPARENT_GIF_BUFFER, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    return new NextResponse(TRANSPARENT_GIF_BUFFER, {
      headers: { "Content-Type": "image/gif" },
    });
  }
}
