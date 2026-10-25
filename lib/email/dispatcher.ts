
import crypto from "crypto";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/db/prisma";
import { signDkimHeader } from "@/lib/dns/dkim";
import { dispatchWebhookEvents } from "@/lib/webhooks/dispatcher";
import { siteConfig } from "@/lib/config/site";
import { dispatchDirectToMx } from "@/lib/email/direct-mx";
import { generatePlainTextFromHtml } from "@/lib/deliverability/spam-checker";

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

  // 1. Strictly verify that the domain belongs to this user's workspace & prevent domain spoofing
  const normalizedDomain = senderDomain.toLowerCase().trim();

  // Find domain belonging to this workspace or associated user memberships
  let domainRecord = await prisma.domain.findFirst({
    where: {
      name: { equals: normalizedDomain, mode: "insensitive" },
      OR: [
        { workspaceId: options.workspaceId },
        { workspace: { members: { some: { workspaceId: options.workspaceId } } } },
      ],
    },
  });

  // Fallback: If sending from a subdomain (e.g. mail.brand.com), check if parent domain (brand.com) is verified
  if (!domainRecord && normalizedDomain.includes(".")) {
    const parts = normalizedDomain.split(".");
    if (parts.length > 2) {
      const parentDomain = parts.slice(1).join(".");
      domainRecord = await prisma.domain.findFirst({
        where: {
          name: { equals: parentDomain, mode: "insensitive" },
          OR: [
            { workspaceId: options.workspaceId },
            { workspace: { members: { some: { workspaceId: options.workspaceId } } } },
          ],
        },
      });
    }
  }

  const isPlatformCoreDomain = normalizedDomain === "getsendport.com";
  if (isPlatformCoreDomain) {
    // Platform administrators can send anywhere from @getsendport.com
    const workspace = options.workspaceId
      ? await prisma.workspace.findUnique({
          where: { id: options.workspaceId },
          include: { members: { include: { user: { select: { role: true, email: true } } } } },
        })
      : null;

    const isPlatformAdmin = workspace?.members.some((m) => m.user.role === "ADMIN");
    if (!isPlatformAdmin) {
      // Sandbox testing: Non-admins can test send from @getsendport.com ONLY to their own registered account email
      const memberEmails = workspace?.members.map((m) => m.user.email.toLowerCase().trim()) || [];
      const isInternalSandboxTest = recipients.every((r) => memberEmails.includes(r.toLowerCase().trim()));

      if (!isInternalSandboxTest) {
        throw new Error(
          `Unauthorized sender domain: Dispatching from "@getsendport.com" to external recipients is restricted. Please add and verify your custom domain in Dashboard > Domains to send emails to any destination.`
        );
      }
    }
  } else if (normalizedDomain !== "localhost") {
    if (!domainRecord) {
      throw new Error(
        `Domain "${senderDomain}" is not added to your Sendport account. Please add and verify your domain in Dashboard > Domains before sending.`
      );
    }

    if (domainRecord.status?.toUpperCase() !== "VERIFIED") {
      throw new Error(
        `Domain "${senderDomain}" DNS records are pending verification. Please verify DKIM & SPF records in Dashboard > Domains before sending.`
      );
    }
  }

  // 1b. Strictly verify workspace daily quota & pay-as-you-go credits
  let workspacePlan = "STARTER";
  if (options.workspaceId) {
    const ws = await prisma.workspace.findUnique({
      where: { id: options.workspaceId },
      select: { usedToday: true, dailyQuota: true, credits: true, plan: true, quotaResetAt: true },
    });
    if (ws) {
      workspacePlan = ws.plan || "STARTER";
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      let currentUsed = ws.usedToday;
      if (!ws.quotaResetAt || new Date(ws.quotaResetAt) < startOfToday) {
        try {
          await prisma.workspace.update({
            where: { id: options.workspaceId },
            data: { usedToday: 0, quotaResetAt: new Date() },
          });
          currentUsed = 0;
        } catch (_) {}
      }

      const neededSends = recipients.length;
      if ((currentUsed + neededSends) > ws.dailyQuota) {
        const overage = (currentUsed + neededSends) - ws.dailyQuota;
        if (ws.credits >= overage) {
          // Deduct from non-expiring credit balance
          await prisma.workspace.update({
            where: { id: options.workspaceId },
            data: { credits: { decrement: overage } },
          });
        } else {
          throw new Error(
            `Daily email quota exceeded (${currentUsed}/${ws.dailyQuota}) and insufficient top-up credits (${ws.credits} available). Top up credits or upgrade at /dashboard/billing.`
          );
        }
      }
    }
  }

  // 2. Generate unique Message-ID and tracking tokens
  const messageId = `msg_${crypto.randomBytes(8).toString("hex")}`;
  const openToken = crypto.randomBytes(16).toString("hex");
  const clickToken = crypto.randomBytes(16).toString("hex");
  const appUrl = siteConfig.url;

  // 3. Tracking Injection & Viral Badge
  let processedHtml = options.html || `<p>${options.text || ""}</p>`;

  // 3a. Viral Attribution Badge (STARTER plan only)
  // Appends a clean, high-converting "Delivered with ⚡ Sendport" footer badge
  if (workspacePlan === "STARTER") {
    const viralBadgeHtml = `
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 36px; padding-top: 18px; border-top: 1px solid #e2e8f0;">
  <tr>
    <td align="center" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; color: #94a3b8; text-align: center;">
      Delivered with <a href="https://getsendport.com/?ref=badge" target="_blank" style="color: #0284c7; font-weight: 700; text-decoration: none;">⚡ Sendport</a> &bull; Developer Email Infrastructure
    </td>
  </tr>
</table>`;
    if (processedHtml.includes("</body>")) {
      processedHtml = processedHtml.replace("</body>", `${viralBadgeHtml}</body>`);
    } else {
      processedHtml += viralBadgeHtml;
    }
  }

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

  // 3b. Automatic Plain Text Generation (Protects against SpamAssassin HTML_ONLY penalty)
  const plainTextBody = options.text || generatePlainTextFromHtml(processedHtml);

  // 3c. RFC 8058 One-Click List-Unsubscribe Headers (Mandated by Google & Yahoo since 2024)
  const unsubscribeUrl = `${appUrl}/api/unsubscribe/${openToken}`;
  const unsubscribeMailto = `mailto:unsubscribe@${senderDomain}?subject=unsubscribe-${openToken}`;
  const listUnsubscribeHeader = `<${unsubscribeUrl}>, <${unsubscribeMailto}>`;
  const listUnsubscribePostHeader = "List-Unsubscribe=One-Click";

  // 4. DKIM Signing (RFC-6376 with RFC 8058 Header Protection)
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
        "List-Unsubscribe": listUnsubscribeHeader,
        "List-Unsubscribe-Post": listUnsubscribePostHeader,
      },
      processedHtml
    );
  }

  // 4b. Dynamic Subdomain Rotation (m1, m2, m3 for custom domains, auth for system)
  const isInternalSystemEmail = normalizedDomain === "getsendport.com" && (options.subject.includes("Security") || options.subject.includes("Welcome") || options.subject.includes("Verification") || options.subject.includes("Reset"));
  const SUBDOMAIN_POOL = ["m1.getsendport.com", "m2.getsendport.com", "m3.getsendport.com"];
  const assignedSubdomain = isInternalSystemEmail
    ? "auth.getsendport.com"
    : SUBDOMAIN_POOL[Math.floor(Math.random() * SUBDOMAIN_POOL.length)];

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
      textBody: plainTextBody,
      status: "PENDING",
      openToken,
      clickToken,
      latencyMs: Date.now() - startTime,
      dkimSigned: !!dkimSignatureHeader,
    },
  });

  // Increment workspace daily quota in real time
  prisma.workspace
    .update({
      where: { id: options.workspaceId },
      data: { usedToday: { increment: recipients.length } },
    })
    .catch(() => {});

  let deliveryStatus: "DELIVERED" | "FAILED" = "FAILED";
  let deliveryError: string | null = null;

  // 6. Real-time Internet Delivery Cascade:
  // Priority 1: Dedicated Autonomous MTA Server (AlphaVPS mail.getsendport.com Direct Port 25 Engine)
  const mtaServerUrl = process.env.MTA_SERVER_URL || "http://mail.getsendport.com";
  const mtaSecretKey = process.env.MTA_SECRET_KEY || "sendport_mta_master_secret_key_2026";

  if (mtaServerUrl && process.env.USE_MTA_SERVER !== "false") {
    try {
      const mtaRes = await fetch(`${mtaServerUrl}/v1/deliver`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-MTA-Key": mtaSecretKey,
        },
        body: JSON.stringify({
          from_address: options.from,
          to_addresses: recipients,
          subject: options.subject,
          html: processedHtml,
          text: plainTextBody,
          reply_to: options.replyTo,
          headers: {
            "List-Unsubscribe": listUnsubscribeHeader,
            "List-Unsubscribe-Post": listUnsubscribePostHeader,
            ...options.headers,
          },
          dkim_selector: domainRecord?.dkimSelector || "sendport",
          dkim_private_key: domainRecord?.dkimPrivateKey || undefined,
        }),
        signal: AbortSignal.timeout(12000),
      });

      if (mtaRes.ok) {
        deliveryStatus = "DELIVERED";
        console.log(`[AUTONOMOUS MTA DISPATCH] Direct MX Delivery Success via AlphaVPS MTA Daemon (${mtaServerUrl})`);
      } else {
        const mtaErr = await mtaRes.text();
        deliveryError = `AlphaVPS MTA Error: ${mtaErr || mtaRes.statusText}`;
        console.warn(`[MTA WARN] ${deliveryError}, falling back to Hostinger/Relay`);
      }
    } catch (mtaErr: any) {
      deliveryError = `AlphaVPS MTA connection error: ${mtaErr.message}`;
      console.warn(`[MTA WARN] ${deliveryError}, falling back to Hostinger/Relay`);
    }
  }

  // Priority 2: Hostinger Enterprise Engine (Native HTTPS Port 443 with Full DKIM & Custom Envelope Sender)
  const hostingerEngineUrl = process.env.HOSTINGER_ENGINE_URL || "https://engine.getsendport.com/sendport_engine.php";
  const sendportSecret = process.env.SENDPORT_SECRET || "sendport_enterprise_jwt_secret_key_2026";

  if (deliveryStatus !== "DELIVERED" && process.env.USE_HOSTINGER_ENGINE !== "false") {
    try {
      const hRes = await fetch(hostingerEngineUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Sendport-Key": sendportSecret,
        },
        body: JSON.stringify({
          from_address: options.from,
          to_addresses: recipients,
          subject: options.subject,
          html: processedHtml,
          text: plainTextBody,
          return_path: `bounces@${senderDomain}`,
          dkim_private_key: domainRecord?.dkimPrivateKey || undefined,
          dkim_selector: domainRecord?.dkimSelector || "sendport",
          dkim_domain: domainRecord?.name || senderDomain,
          headers: {
            "Message-ID": `<${messageId}@${senderDomain}>`,
            "List-Unsubscribe": listUnsubscribeHeader,
            "List-Unsubscribe-Post": listUnsubscribePostHeader,
            "Return-Path": `<bounces@${senderDomain}>`,
            "X-Entity-Ref-ID": messageId,
            "X-Sendport-Node": assignedSubdomain,
            ...(dkimSignatureHeader ? { "DKIM-Signature": dkimSignatureHeader } : {}),
            ...options.headers,
          },
        }),
        signal: AbortSignal.timeout(8000),
      });
      const hData = await hRes.json().catch(() => ({}));
      if (hRes.ok && hData.success) {
        deliveryStatus = "DELIVERED";
        console.log(`[HOSTINGER ENTERPRISE DISPATCH] Delivered with full DKIM signature and custom Envelope Sender`);
      } else {
        deliveryError = `Hostinger Engine Error: ${hData.error || hRes.statusText}`;
      }
    } catch (hErr: any) {
      deliveryError = `Hostinger Engine Connection Error: ${hErr.message}`;
    }
  }

  // Priority 3: High-Speed SMTP / SES Relay (Port 465 SSL / 587 TLS)
  if (deliveryStatus !== "DELIVERED" && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_HOST) {
    try {
      const port = parseInt(process.env.SMTP_PORT || "465", 10);
      const isSecure = process.env.SMTP_SECURE === "true" || port === 465;

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: isSecure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        tls: {
          rejectUnauthorized: false,
          minVersion: "TLSv1.2",
        },
      });

      await transporter.sendMail({
        from: options.from,
        to: recipients,
        subject: options.subject,
        html: processedHtml,
        text: plainTextBody,
        replyTo: options.replyTo,
        headers: {
          "Message-ID": `<${messageId}@${senderDomain}>`,
          "List-Unsubscribe": listUnsubscribeHeader,
          "List-Unsubscribe-Post": listUnsubscribePostHeader,
          ...(dkimSignatureHeader ? { "DKIM-Signature": dkimSignatureHeader } : {}),
          ...options.headers,
        },
      });
      deliveryStatus = "DELIVERED";
      console.log(`[SMTP RELAY DISPATCH] Successfully delivered via ${process.env.SMTP_HOST}`);
    } catch (smtpError: any) {
      deliveryError = `Outbound Relay Error: ${smtpError.message}`;
    }
  }

  // Priority 4: Cloudflare Edge Worker Layer
  if (deliveryStatus !== "DELIVERED" && process.env.CLOUDFLARE_WORKER_URL) {
    try {
      const cfRes = await fetch(process.env.CLOUDFLARE_WORKER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Sendport-Key": process.env.SENDPORT_SECRET || "sendport_edge_master_key_2026",
        },
        body: JSON.stringify({
          from_address: options.from,
          to_addresses: recipients,
          subject: options.subject,
          html: processedHtml,
          text: plainTextBody,
          reply_to: options.replyTo,
          return_path: `bounces@${assignedSubdomain}`,
          headers: {
            "Message-ID": `<${messageId}@${senderDomain}>`,
            "List-Unsubscribe": listUnsubscribeHeader,
            "List-Unsubscribe-Post": listUnsubscribePostHeader,
            "Return-Path": `<bounces@${assignedSubdomain}>`,
            "X-Sendport-Node": assignedSubdomain,
            ...(dkimSignatureHeader ? { "DKIM-Signature": dkimSignatureHeader } : {}),
            ...options.headers,
          },
        }),
        signal: AbortSignal.timeout(8000),
      });
      const cfData = await cfRes.json().catch(() => ({}));
      if (cfRes.ok && cfData.success) {
        deliveryStatus = "DELIVERED";
        console.log(`[CLOUDFLARE EDGE DISPATCH] Delivered directly via Cloudflare Edge Worker`);
      } else {
        deliveryError = `Cloudflare Worker Error: ${cfData.error || cfRes.statusText}`;
      }
    } catch (cfErr: any) {
      deliveryError = `Cloudflare Worker Connection Error: ${cfErr.message}`;
    }
  }

  // Priority 5: Direct MX Handshake (Opportunistic)
  if (deliveryStatus !== "DELIVERED") {
    const directResult = await dispatchDirectToMx({
      from: options.from,
      to: recipients,
      subject: options.subject,
      html: processedHtml,
      text: plainTextBody,
      replyTo: options.replyTo,
      headers: {
        "Message-ID": `<${messageId}@${senderDomain}>`,
        "List-Unsubscribe": listUnsubscribeHeader,
        "List-Unsubscribe-Post": listUnsubscribePostHeader,
        ...(dkimSignatureHeader ? { "DKIM-Signature": dkimSignatureHeader } : {}),
        ...options.headers,
      },
      messageId,
      dkimSignatureHeader,
    });

    if (directResult.success) {
      deliveryStatus = "DELIVERED";
      console.log(`[RENDER DIRECT MX] 100% Native Delivery to recipient MX via Render Port 25`);
    } else {
      deliveryError = directResult.error || deliveryError || "Direct MX delivery failed";
      console.warn(`[DIRECT MX FAILED]:`, deliveryError);
    }
  }

  // Update Database with Actual Truthful Delivery State
  await prisma.emailLog.update({
    where: { id: emailLog.id },
    data: {
      status: deliveryStatus,
      bounceReason: deliveryError || null,
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
