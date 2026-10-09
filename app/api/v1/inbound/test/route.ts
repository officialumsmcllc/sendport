import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getAuthContext } from "@/lib/auth/workspace-auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { url } = body;

    if (!url || !url.startsWith("http")) {
      return NextResponse.json({ error: "Invalid webhook URL" }, { status: 400 });
    }

    const mockPayload = {
      event: "inbound.email",
      timestamp: new Date().toISOString(),
      messageId: `msg_inbound_${crypto.randomBytes(8).toString("hex")}`,
      from: "customer@example.com",
      to: [`support@${auth.workspace.slug}.com`],
      subject: "Test Inbound Webhook Dispatch",
      text: "This is a test inbound email payload from Sendport.",
      html: "<p>This is a test inbound email payload from Sendport.</p>",
      headers: {
        "X-Sendport-Delivery": "test-ping",
      },
    };

    const startTime = Date.now();
    let statusCode = 0;
    let responseText = "";
    let isSuccess = false;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Sendport-Inbound-Webhook/1.0",
        },
        body: JSON.stringify(mockPayload),
        signal: AbortSignal.timeout(5000),
      });

      statusCode = res.status;
      responseText = await res.text().catch(() => "");
      isSuccess = res.ok;
    } catch (fetchErr: any) {
      responseText = fetchErr.message || "Connection failed or timed out";
      statusCode = 504;
    }

    const latencyMs = Date.now() - startTime;

    // Find webhook to log delivery
    const webhook = await prisma.webhook.findFirst({
      where: { workspaceId: auth.workspace.id, events: { contains: "inbound" } },
    });

    if (webhook) {
      await prisma.webhookDeliveryLog.create({
        data: {
          webhookId: webhook.id,
          event: "inbound.test",
          payload: JSON.stringify(mockPayload),
          statusCode,
          response: responseText.slice(0, 500),
          success: isSuccess,
        },
      });
    }

    return NextResponse.json({
      success: isSuccess,
      statusCode,
      latencyMs,
      responseSummary: responseText.slice(0, 200),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
