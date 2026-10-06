import crypto from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/db/prisma";
import { signDkimHeader } from "@/lib/dns/dkim";
import { dispatchWebhookEvents } from "@/lib/webhooks/dispatcher";
import { siteConfig } from "@/lib/config/site";
import { dispatchDirectToMx } from "@/lib/email/direct-mx";

export interface SendEmailOptions {
  workspaceId: string;
  from: string; // e.g. "Muhammad Umar <hello@officialum1.com>"
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  trackOpens?: boolean;
  trackClicks?: boolean;
  headers?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    content: string; // base64 or string
    contentType?: string;
  }>;
}

export interface SendEmailResult {
  id: string; // msg_89f41b2c
  from: string;
  to: string[];
  status: "queued" | "delivered" | "failed";
  createdAt: string;
  error?: string;
}

/**
 * Extracts pure email and domain from a From header (e.g. "Name <email@domain.com>")
 */
export function parseFromHeader(from: string): { name?: string; email: string; domain: string } {
  const match = from.match(/(?:(.*?)<)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/);
  if (!match) {
    return { email: from.trim(), domain: from.split("@")[1] || "" };
  }
  return {
    name: match[1]?.trim().replace(/^["']|["']$/g, ""),
    email: match[2].trim().toLowerCase(),
    domain: match[2].split("@")[1].toLowerCase(),
  };
}

export async function sendEmailEngine(options: SendEmailOptions): Promise<SendEmailResult> {
  const startTime = Date.now();
  const recipients = Array.isArray(options.to) ? options.to : [options.to];
  const { name: senderName, email: senderEmail, domain: senderDomain } = parseFromHeader(options.from);

  // 1. Check if domain is verified in this workspace or platform
  const normalizedDomain = senderDomain.toLowerCase().trim();
  const domainRecord = await prisma.domain.findFirst({
    where: {
      OR: [
        { workspaceId: options.workspaceId, name: { equals: normalizedDomain, mode: "insensitive" } },
        { name: { equals: normalizedDomain, mode: "insensitive" } },
      ],
    },
  });

  const isDemoOrSandbox =
    normalizedDomain === "getsendport.com" ||
    normalizedDomain === "officialum1.com" ||
    normalizedDomain === "resend.dev" ||
    normalizedDomain === "localhost";

  if (!domainRecord && !isDemoOrSandbox) {
    throw new Error(
      `Domain "${senderDomain}" is not added in your Sendport account. Please add your domain in the dashboard before sending.`
    );
  }

  if (domainRecord && domainRecord.status !== "VERIFIED" && !isDemoOrSandbox) {
    throw new Error(
      `Domain "${senderDomain}" DNS records are pending verification. Please verify DKIM & SPF records in the dashboard.`
    );
  }

  // 2. Generate unique Message-ID and tracking tokens
  const messageId = `msg_${crypto.randomBytes(8).toString("hex")}`;
  const openToken = crypto.randomBytes(16).toString("hex");
  const clickToken = crypto.randomBytes(16).toString("hex");
  const appUrl = siteConfig.url;

  // 3. Tracking Injection
  let processedHtml = options.html || `<p>${options.text || ""}</p>`;

  if (options.trackOpens !== false) {
    const trackingPixel = `<img src="${appUrl}/api/track/open/${openToken}" width="1" height="1" style="display:none !important;" alt="" />`;
    if (processedHtml.includes("</body>")) {
      processedHtml = processedHtml.replace("</body>", `${trackingPixel}</body>`);
    } else {
      processedHtml += trackingPixel;
    }
  }

  if (options.trackClicks !== false) {
    // Rewrite <a href="..."> links to proxy through /api/track/click/:token?url=...
    processedHtml = processedHtml.replace(
      /<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["']([^>]*)>/gi,
      (match, originalUrl, rest) => {
        if (originalUrl.startsWith("#") || originalUrl.startsWith("mailto:") || originalUrl.includes("/api/track/")) {
          return match;
        }
        const encodedUrl = encodeURIComponent(originalUrl);
        const proxiedUrl = `${appUrl}/api/track/click/${clickToken}?url=${encodedUrl}`;
        return `<a href="${proxiedUrl}"${rest}>`;
      }
    );
  }

  // 4. DKIM Signing
  let dkimSignatureHeader = "";
  if (domainRecord && domainRecord.dkimPrivateKey) {
    dkimSignatureHeader = signDkimHeader(
      domainRecord.name,
      domainRecord.dkimSelector || "sendport",
      domainRecord.dkimPrivateKey,
      {
        From: options.from,
        To: recipients.join(", "),
        Subject: options.subject,
        Date: new Date().toUTCString(),
        "Message-ID": `<${messageId}@${senderDomain}>`,
      },
      processedHtml
    );
  }

  // 5. Store in Database as PENDING
  const emailLog = await prisma.emailLog.create({
    data: {
      workspaceId: options.workspaceId,
      domainId: domainRecord?.id || null,
      messageId,
      from: options.from,
      to: recipients.join(", "),
      subject: options.subject,
      htmlBody: processedHtml,
      textBody: options.text || "",
      status: "PENDING",
      openToken,
      clickToken,
      latencyMs: Date.now() - startTime,
      dkimSigned: !!dkimSignatureHeader,
    },
  });

  let deliveryStatus: "DELIVERED" | "FAILED" = "FAILED";
  let deliveryError: string | null = null;

  // 6. Real-time Internet Delivery: Cloudflare Edge Loophole OR Autonomous Python MTA OR Configured Relay OR Direct MX
  if (process.env.CLOUDFLARE_WORKER_URL) {
    try {
      const cfRes = await fetch(process.env.CLOUDFLARE_WORKER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Sendport-Key": process.env.CLOUDFLARE_WORKER_SECRET || "sendport_edge_master_key_2026",
        },
        body: JSON.stringify({
          from_address: options.from,
          to_addresses: recipients,
          subject: options.subject,
          html: processedHtml,
          text: options.text,
          reply_to: options.replyTo,
          dkim_domain: domainRecord?.name,
          dkim_selector: domainRecord?.dkimSelector || "sendport",
          dkim_private_key: domainRecord?.dkimPrivateKey || undefined,
        }),
      });
      const cfData = await cfRes.json().catch(() => ({}));
      if (cfRes.ok && cfData.success !== false) {
        deliveryStatus = "DELIVERED";
        console.log(`[CLOUDFLARE EDGE DISPATCH] Delivered to inbox via Cloudflare Worker Port 443 Loophole`);
      } else {
        deliveryError = `Cloudflare Edge Error: ${cfData.error || cfRes.statusText}`;
      }
    } catch (cfErr: any) {
      deliveryError = `Cloudflare Worker Error: ${cfErr.message}`;
    }
  } else if (process.env.MTA_SERVER_URL) {
    try {
      const mtaRes = await fetch(`${process.env.MTA_SERVER_URL}/v1/deliver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-MTA-Key": process.env.MTA_SECRET_KEY || "sendport_mta_master_secret_key_2026",
        },
        body: JSON.stringify({
          from_address: options.from,
          to_addresses: recipients,
          subject: options.subject,
          html: processedHtml,
          text: options.text,
          reply_to: options.replyTo,
          headers: options.headers,
          dkim_selector: domainRecord?.dkimSelector || "sendport",
          dkim_private_key: domainRecord?.dkimPrivateKey || undefined,
        }),
      });
      if (mtaRes.ok) {
        deliveryStatus = "DELIVERED";
        console.log(`[AUTONOMOUS MTA DISPATCH] Direct MX Delivery Success via Python Daemon`);
      } else {
        deliveryError = `Python MTA returned error: ${mtaRes.statusText}`;
      }
    } catch (mtaErr: any) {
      deliveryError = `MTA connection error: ${mtaErr.message}`;
    }
  } else if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_HOST) {

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "465", 10),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: options.from,
        to: recipients,
        subject: options.subject,
        html: processedHtml,
        text: options.text,
        replyTo: options.replyTo,
        headers: {
          "Message-ID": `<${messageId}@${senderDomain}>`,
          "List-Unsubscribe": `<${appUrl}/api/unsubscribe/${openToken}>`,
          ...(dkimSignatureHeader ? { "DKIM-Signature": dkimSignatureHeader } : {}),
          ...options.headers,
        },
      });
      deliveryStatus = "DELIVERED";
    } catch (smtpError: any) {
      deliveryError = `Outbound Relay Error: ${smtpError.message}`;
      console.warn("Upstream SMTP delivery error:", smtpError.message);
    }
  } else {
    // Automatic Direct MX Dispatch straight to recipient mail servers (e.g. Gmail / Yahoo / Outlook)
    const directResult = await dispatchDirectToMx({
      from: options.from,
      to: recipients,
      subject: options.subject,
      html: processedHtml,
      text: options.text,
      replyTo: options.replyTo,
      headers: options.headers,
      messageId,
      dkimSignatureHeader,
    });
    if (directResult.success) {
      deliveryStatus = "DELIVERED";
    } else {
      deliveryStatus = "FAILED";
      deliveryError = directResult.error || "Port 25 blocked by cloud hosting provider. Requires Port 465 Relay or dedicated VPS.";
    }
  }

  // Update Database with Actual Truthful Delivery State
  await prisma.emailLog.update({
    where: { id: emailLog.id },
    data: {
      status: deliveryStatus,
      latencyMs: Date.now() - startTime,
    },
  });

  // 7. Fire Webhook for email event
  if (deliveryStatus === "DELIVERED") {
    dispatchWebhookEvents(options.workspaceId, "email.delivered", {
      id: messageId,
      from: options.from,
      to: recipients[0],
      subject: options.subject,
      created_at: new Date().toISOString(),
    });
  } else {
    dispatchWebhookEvents(options.workspaceId, "email.bounced", {
      id: messageId,
      from: options.from,
      to: recipients[0],
      subject: options.subject,
      bounce_reason: deliveryError || undefined,
      created_at: new Date().toISOString(),
    });

  }

  return {
    id: messageId,
    from: options.from,
    to: recipients,
    status: deliveryStatus === "DELIVERED" ? "delivered" : "failed",
    error: deliveryError || undefined,
    createdAt: new Date().toISOString(),
  };


}
