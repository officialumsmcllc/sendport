import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { dispatchWebhookEvents } from "@/lib/webhooks/dispatcher";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const { searchParams } = new URL(req.url);
    const destinationUrl = searchParams.get("url") || "https://getsendport.com";

    const emailLog = await prisma.emailLog.findUnique({
      where: { clickToken: token },
    });

    if (emailLog) {
      await prisma.emailLog.update({
        where: { id: emailLog.id },
        data: {
          clickCount: { increment: 1 },
          status: "CLICKED",
        },
      });

      const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
      const userAgent = req.headers.get("user-agent");

      await prisma.trackingEvent.create({
        data: {
          emailLogId: emailLog.id,
          type: "CLICK",
          targetUrl: destinationUrl,
          ip: ip || null,
          userAgent: userAgent || null,
        },
      });

      // Trigger webhook event
      dispatchWebhookEvents(emailLog.workspaceId, "email.clicked", {
        id: emailLog.messageId,
        from: emailLog.from,
        to: emailLog.to,
        subject: emailLog.subject,
        created_at: new Date().toISOString(),
        url: destinationUrl,
      });
    }

    // Safely redirect to target destination
    return NextResponse.redirect(destinationUrl, { status: 302 });
  } catch (error) {
    return NextResponse.redirect("https://getsendport.com", { status: 302 });
  }
}
