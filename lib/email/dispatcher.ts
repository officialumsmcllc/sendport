

/**
 * Detects whether a delivery rejection is a true permanent hard bounce (e.g. non-existent mailbox).
 * Policy, SPF/DKIM/DMARC, PTR, or reputation errors must NEVER be treated as hard bounces,
 * because the recipient's mailbox is completely active and legitimate.
 */
function detectHardBounce(errText: any): string | null {
  if (!errText) return null;
  const lower = (typeof errText === "string" ? errText : String(errText)).toLowerCase();

  // 1. Policy, authentication, PTR/rDNS, IP reputation, or spam blocks are NOT recipient hard bounces!
  // Allowing these through enables fallback cascade (Hostinger Enterprise Engine / SMTP Relay)
  const isPolicyOrAuth =
    lower.includes("5.7.") ||
    lower.includes("5.7.1") ||
    lower.includes("5.7.26") ||
    lower.includes("spf") ||
    lower.includes("dkim") ||
    lower.includes("dmarc") ||
    lower.includes("ptr") ||
    lower.includes("reverse dns") ||
    lower.includes("reputation") ||
    lower.includes("spamhaus") ||
    lower.includes("unsolicited") ||
    lower.includes("blocked") ||
    lower.includes("blacklist") ||
    lower.includes("rate limit") ||
    lower.includes("throttled") ||
    lower.includes("greylist");

  if (isPolicyOrAuth) {
    return null; // Do NOT stop cascade! Allow fallback engines to attempt delivery.
  }

  // 2. Genuine non-existent recipient mailboxes (RFC 3463 5.1.1)
  if (
    lower.includes("5.1.1") ||
    lower.includes("nosuchuser") ||
    lower.includes("no such user") ||
    lower.includes("user unknown") ||
    lower.includes("mailbox not found") ||
    lower.includes("recipient not found") ||
    lower.includes("invalid recipient") ||
    lower.includes("recipient address rejected: user unknown") ||
    lower.includes("does not exist")
  ) {
    return "Recipient mailbox does not exist (550 5.1.1 NoSuchUser)";
  }

  return null;
}


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
export function parseFromHeader(from: string): { name?: string; email: string; address: string; domain: string } {
  const match = from.match(/(?:(.*?)<)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/);
  if (!match) {
    const clean = from.trim();
    return { email: clean, address: clean, domain: from.split("@")[1] || "" };
  }
  const email = match[2].trim().toLowerCase();
  return {
    name: match[1]?.trim().replace(/^["']|["']$/g, ""),
    email,
    address: email,
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

  // 3b. Anti-Spam & Deliverability Protection:
  // Google & Yahoo (2024/2026 Sender Policy) aggressively flag unaligned cross-domain tracking pixels
  // (e.g. inserting getsendport.com tracking image inside an email sent from a custom domain like iptvsmart.us)
  // as phishing / spoofing, resulting in "550 5.7.1 low domain reputation / suspicious sender" gateway blocks.
  // We only inject tracking pixels & click proxies if the sender domain matches the app domain,
  // or if explicitly aligned to guarantee 100% primary inbox deliverability to Gmail & Yahoo.
  let appHost = "getsendport.com";
  try {
    appHost = new URL(appUrl).hostname.toLowerCase();
  } catch {}
  const isAlignedDomain = senderDomain === appHost;

  if (options.trackOpens && isAlignedDomain) {
    const trackingPixel = `<img src="${appUrl}/api/track/open/${openToken}" width="1" height="1" style="display:none !important;" alt="" />`;
    if (processedHtml.includes("</body>")) {
      processedHtml = processedHtml.replace("</body>", `${trackingPixel}</body>`);
    } else {
      processedHtml += trackingPixel;
    }
  }

  if (options.trackClicks && isAlignedDomain) {
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

  let deliveryStatus: "DELIVERED" | "BOUNCED" | "FAILED" | "QUEUED" = "FAILED";
  let bounceType: "HARD" | "SOFT" | null = null;
  let deliveryError: string | null = null;
  let dispatchIp: string = "45.59.103.242";

  // 6. Direct Outbound Email Delivery via Dedicated Autonomous VPS MTA Server
  // Host: mail.getsendport.com (Dedicated IP: 45.59.103.242)
  const mtaServerUrl = process.env.MTA_SERVER_URL || "http://mail.getsendport.com";
  const mtaSecretKey = process.env.MTA_SECRET_KEY || "sendport_mta_master_secret_key_2026";

  const parsedFrom = parseFromHeader(options.from);
  const cleanFromAddress = parsedFrom.address || parsedFrom.email || senderEmail || options.from;

  try {
    const mtaRes = await fetch(`${mtaServerUrl}/v1/deliver`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-MTA-Key": mtaSecretKey,
      },
      body: JSON.stringify({
        from_address: cleanFromAddress,
        from_header: options.from,
        to_addresses: recipients,
        subject: options.subject,
        html: processedHtml,
        text: plainTextBody,
        reply_to: options.replyTo,
        headers: (() => {
          const h: Record<string, string> = {
            "List-Unsubscribe": listUnsubscribeHeader,
            "List-Unsubscribe-Post": listUnsubscribePostHeader,
            "Feedback-ID": `sendport:${options.workspaceId || "direct"}:${domainRecord?.name || senderDomain}:blast`,
            "X-Entity-Ref-ID": messageId,
          };
          if (options.headers) {
            for (const [k, v] of Object.entries(options.headers)) {
              if (v !== undefined && v !== null) {
                h[k] = String(v);
              }
            }
          }
          return h;
        })(),
        dkim_selector: domainRecord?.dkimSelector || "sendport",
        dkim_private_key: domainRecord?.dkimPrivateKey || undefined,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (mtaRes.ok) {
      deliveryStatus = "DELIVERED";
      deliveryError = null;
      console.log(`[AUTONOMOUS MTA DISPATCH] Direct Delivery Success via Dedicated VPS MTA (${mtaServerUrl})`);
    } else {
      const mtaErr = await mtaRes.text();
      let parsedDetail = mtaErr;
      try {
        const json = JSON.parse(mtaErr);
        if (json.detail) {
          if (typeof json.detail === "string") {
            parsedDetail = json.detail;
          } else if (Array.isArray(json.detail)) {
            // FastAPI Pydantic validation error array: [{ loc: [...], msg: "..." }]
            parsedDetail = json.detail
              .map((d: any) => (d.msg ? `${d.loc?.filter((x: any) => x !== "body").join(".") || "param"}: ${d.msg}` : JSON.stringify(d)))
              .join("; ");
          } else {
            parsedDetail = JSON.stringify(json.detail);
          }
        } else if (json.message) {
          parsedDetail = typeof json.message === "string" ? json.message : JSON.stringify(json.message);
        }
      } catch (_) {}

      const cleanDetail = typeof parsedDetail === "string" ? parsedDetail : String(parsedDetail || "");
      const lowerDetail = cleanDetail.toLowerCase();

      const isSoftThrottle =
        mtaRes.status === 429 ||
        lowerDetail.includes("adaptive throttle") ||
        lowerDetail.includes("421") ||
        lowerDetail.includes("451") ||
        lowerDetail.includes("rate limit") ||
        lowerDetail.includes("try again later");

      if (isSoftThrottle) {
        deliveryStatus = "QUEUED";
        bounceType = "SOFT";
        deliveryError = `Adaptive Throttle Pacing (421): ${cleanDetail}`;
        console.warn(`[ADAPTIVE THROTTLE SOFT DEFERRAL] ${deliveryError}`);
      } else {
        const hardBounce = detectHardBounce(cleanDetail);
        if (hardBounce) {
          deliveryStatus = "BOUNCED";
          bounceType = "HARD";
          deliveryError = hardBounce;
          console.warn(`[MTA HARD BOUNCE] Destination MX rejected recipient: ${hardBounce}`);
        } else {
          deliveryStatus = "FAILED";
          bounceType = null;
          deliveryError = `Dedicated VPS MTA: ${cleanDetail || mtaRes.statusText}`;
          console.warn(`[MTA DELIVERY FAILURE] ${deliveryError}`);
        }
      }
    }
  } catch (mtaErr: any) {
    deliveryStatus = "FAILED";
    deliveryError = `Dedicated VPS MTA connection error: ${mtaErr?.message || String(mtaErr)}`;
    console.warn(`[MTA CONNECTION ERROR] ${deliveryError}`);
  }

  // Optional: User-configured custom SMTP Relay (Port 465 / 587) ONLY if explicitly provided in environment
  if (deliveryStatus !== "DELIVERED" && deliveryStatus !== "BOUNCED" && process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_HOST) {
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
      deliveryError = null;
      console.log(`[SMTP RELAY DISPATCH] Successfully delivered via ${process.env.SMTP_HOST}`);
    } catch (smtpError: any) {
      deliveryError = `Outbound Relay Error: ${smtpError.message}`;
    }
  }

  // Priority 5: Direct MX Handshake (Opportunistic)
  if (deliveryStatus === "FAILED" && process.env.ENABLE_RENDER_DIRECT_MX === "true") {
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
      bounceType,
      bounceReason: deliveryError || null,
      ipAddress: dispatchIp,
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
  } else if (deliveryStatus === "BOUNCED") {
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
    status: deliveryStatus === "DELIVERED" ? "delivered" : deliveryStatus === "QUEUED" ? "queued" : "failed",
    error: deliveryError || undefined,
    createdAt: new Date().toISOString(),
  };


}
