import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";

export interface WebhookEventPayload {
  event: "email.sent" | "email.delivered" | "email.opened" | "email.clicked" | "email.bounced" | "email.complained";
  data: {
    id: string;
    from: string;
    to: string;
    subject: string;
    created_at: string;
    url?: string;
    bounce_reason?: string;
  };
}

export async function dispatchWebhookEvents(
  workspaceId: string,
  eventType: WebhookEventPayload["event"],
  payloadData: WebhookEventPayload["data"]
) {
  try {
    const webhooks = await prisma.webhook.findMany({
      where: {
        workspaceId,
        isActive: true,
      },
    });

    const payload: WebhookEventPayload = {
      event: eventType,
      data: payloadData,
    };
    const payloadString = JSON.stringify(payload);

    for (const webhook of webhooks) {
      if (!webhook.events.includes(eventType) && !webhook.events.includes("*")) {
        continue;
      }

      // Compute HMAC-SHA256 signature
      const signature = crypto
        .createHmac("sha256", webhook.secret)
        .update(payloadString)
        .digest("hex");

      // Dispatch async (fire-and-forget with logging)
      fetch(webhook.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Sendport-Signature": signature,
          "X-Sendport-Event": eventType,
          "User-Agent": "Sendport-Webhooks/1.0",
        },
        body: payloadString,
      })
        .then(async (res) => {
          await prisma.webhookDeliveryLog.create({
            data: {
              webhookId: webhook.id,
              event: eventType,
              payload: payloadString,
              statusCode: res.status,
              success: res.ok,
            },
          });
        })
        .catch(async (err) => {
          await prisma.webhookDeliveryLog.create({
            data: {
              webhookId: webhook.id,
              event: eventType,
              payload: payloadString,
              statusCode: 0,
              response: err.message || "Network Timeout",
              success: false,
            },
          });
        });
    }
  } catch (error) {
    console.error("Webhook dispatching error:", error);
  }
}
