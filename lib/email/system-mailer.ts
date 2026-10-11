import { dispatchDirectToMx } from "@/lib/email/direct-mx";

export interface SystemEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  fromName?: string;
}

/**
 * Universal System & Transactional Mailer.
 * Dispatches platform emails from "no-reply@getsendport.com"
 * WITHOUT requiring external SMTP configuration on Render!
 * 
 * Dispatch cascade:
 * 1. Hostinger Enterprise HTTP Engine (engine.getsendport.com)
 * 2. Direct-to-MX DNS Dispatch (opportunistic Port 25 STARTTLS)
 * 3. Fallback SMTP (if credentials exist)
 */
export async function sendSystemEmail(options: SystemEmailOptions): Promise<boolean> {
  const fromName = options.fromName || "Sendport";
  const fromAddress = `"${fromName}" <no-reply@getsendport.com>`;
  const hostingerEngineUrl = process.env.HOSTINGER_ENGINE_URL || "https://engine.getsendport.com/sendport_engine.php";
  const plainText = options.text || options.html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  // Priority 1: Hostinger Enterprise HTTP Dispatch (Works 100% over standard HTTPS Port 443)
  try {
    const res = await fetch(hostingerEngineUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Sendport-Key": process.env.SENDPORT_SECRET || "sendport_enterprise_jwt_secret_key_2026",
      },
      body: JSON.stringify({
        from_address: fromAddress,
        to_addresses: [options.to],
        subject: options.subject,
        html: options.html,
        text: plainText,
        return_path: "bounces@getsendport.com",
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.success) {
      console.log(`[SYSTEM MAILER] Successfully delivered to ${options.to} via Hostinger HTTP Engine.`);
      return true;
    }
  } catch (err) {
    console.warn("[SYSTEM MAILER] Hostinger HTTP Engine delivery attempt failed:", err);
  }

  // Priority 2: Direct MX Dispatch (Direct to recipient mail server)
  try {
    const directResult = await dispatchDirectToMx({
      from: fromAddress,
      to: [options.to],
      subject: options.subject,
      html: options.html,
      text: plainText,
      messageId: `sys_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    });

    if (directResult.success) {
      console.log(`[SYSTEM MAILER] Successfully delivered to ${options.to} via Direct MX.`);
      return true;
    }
  } catch (err) {
    console.warn("[SYSTEM MAILER] Direct MX dispatch attempt failed:", err);
  }

  // Priority 3: Fallback SMTP (if environment variables exist)
  if (process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SMTP_HOST) {
    try {
      const nodemailer = (await import("nodemailer")).default;
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
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: plainText,
      });

      console.log(`[SYSTEM MAILER] Delivered to ${options.to} via SMTP fallback.`);
      return true;
    } catch (smtpErr) {
      console.error("[SYSTEM MAILER] SMTP fallback failed:", smtpErr);
    }
  }

  return false;
}

// -------------------------------------------------------------
// BRANDED TRANSACTIONAL EMAIL TEMPLATES
// -------------------------------------------------------------

const emailHeader = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 28px; background: #0b0f19; border: 1px solid #1e293b; border-radius: 16px; color: #f8fafc;">
  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid #1e293b;">
    <div style="font-size: 20px; font-weight: 900; letter-spacing: -0.5px; color: #38bdf8;">
      Sendport <span style="font-size: 11px; padding: 2px 6px; background: #0284c7; color: #ffffff; border-radius: 4px; font-weight: 700;">ENGINE</span>
    </div>
    <span style="font-size: 11px; font-family: monospace; color: #64748b;">getsendport.com</span>
  </div>
`;

const emailFooter = `
  <hr style="border: none; border-top: 1px solid #1e293b; margin: 28px 0 20px 0;" />
  <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; font-family: monospace;">
    <span>Sendport Technologies &bull; Next-Gen Email Delivery</span>
    <a href="https://getsendport.com/docs" style="color: #38bdf8; text-decoration: none;">API Docs</a>
  </div>
</div>
`;

/**
 * 1. Welcome Onboarding Email (Signup)
 */
export async function sendWelcomeEmail(user: { email: string; name?: string | null }): Promise<boolean> {
  const name = user.name || "Developer";
  const html = `
${emailHeader}
  <h2 style="color: #ffffff; font-size: 22px; font-weight: 800; margin-top: 0; margin-bottom: 12px;">Welcome to Sendport, ${name}! 🚀</h2>
  <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
    Your developer account and workspace have been provisioned. You can now add your sending domains, generate 2048-bit RSA DKIM records, and dispatch transactional emails with sub-10ms latency.
  </p>

  <div style="background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; margin: 24px 0;">
    <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px;">Your Free Starter Plan Includes:</p>
    <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #cbd5e1; line-height: 1.8;">
      <li><strong>100 Free Emails / Day</strong> (3,000 / month)</li>
      <li>Custom Domain Authentication (DKIM + SPF + DMARC)</li>
      <li>Instant SMTP Relay (Ports 587 &amp; 465)</li>
      <li>REST API with TypeScript, Python &amp; cURL SDKs</li>
      <li>Real-time Open &amp; Click Telemetry</li>
    </ul>
  </div>

  <div style="text-align: center; margin: 28px 0 20px 0;">
    <a href="https://getsendport.com/dashboard" style="background: #0284c7; color: #ffffff; padding: 13px 28px; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 10px; display: inline-block; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);">
      Launch Your Dashboard &rarr;
    </a>
  </div>

  <p style="color: #64748b; font-size: 12px; text-align: center; margin: 0;">
    Need help setting up DNS? Check our <a href="https://getsendport.com/docs" style="color: #38bdf8;">Integration Documentation</a> or reply to this message.
  </p>
${emailFooter}
  `;

  return sendSystemEmail({
    to: user.email,
    subject: "Welcome to Sendport — Start sending emails in seconds! 🚀",
    html,
  });
}

/**
 * 2. Package Upgrade & Payment Approval Confirmation Email
 */
export async function sendPlanUpgradeEmail(
  user: { email: string; name?: string | null },
  plan: string,
  dailyQuota: number
): Promise<boolean> {
  const name = user.name || "Customer";
  const planDisplay = plan === "SCALE_PRO" ? "Scale Pro" : plan === "GROWTH" ? "Growth" : plan;

  const html = `
${emailHeader}
  <div style="display: inline-block; background: #065f46; color: #34d399; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
    ✓ Account Upgraded
  </div>
  <h2 style="color: #ffffff; font-size: 22px; font-weight: 800; margin-top: 0; margin-bottom: 12px;">Congratulations, ${name}! 🎉</h2>
  <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
    Your payment has been verified and your Sendport workspace has been upgraded to the <strong>${planDisplay} Plan</strong>!
  </p>

  <div style="background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; margin: 24px 0;">
    <p style="margin: 0 0 10px 0; font-size: 12px; font-weight: 800; color: #34d399; text-transform: uppercase; letter-spacing: 0.5px;">Your New Active Limits:</p>
    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #1f2937;">
      <span style="font-size: 13px; color: #94a3b8;">Active Plan:</span>
      <span style="font-size: 13px; font-weight: 800; color: #ffffff;">${planDisplay}</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #1f2937;">
      <span style="font-size: 13px; color: #94a3b8;">Daily Sending Limit:</span>
      <span style="font-size: 13px; font-weight: 800; color: #38bdf8;">${dailyQuota.toLocaleString()} emails/day</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span style="font-size: 13px; color: #94a3b8;">Primary Inbox Placement:</span>
      <span style="font-size: 13px; font-weight: 800; color: #34d399;">Active (2048-bit DKIM)</span>
    </div>
  </div>

  <div style="text-align: center; margin: 28px 0 20px 0;">
    <a href="https://getsendport.com/dashboard" style="background: #0284c7; color: #ffffff; padding: 13px 28px; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 10px; display: inline-block; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.4);">
      Go to Dashboard &rarr;
    </a>
  </div>
${emailFooter}
  `;

  return sendSystemEmail({
    to: user.email,
    subject: `🎉 Your Sendport Workspace is upgraded to ${planDisplay}!`,
    html,
  });
}

/**
 * 3. Subscription Expiry Warning Email
 */
export async function sendPlanExpiryWarningEmail(
  user: { email: string; name?: string | null },
  plan: string,
  daysLeft: number
): Promise<boolean> {
  const name = user.name || "Customer";
  const planDisplay = plan === "SCALE_PRO" ? "Scale Pro" : plan === "GROWTH" ? "Growth" : plan;

  const html = `
${emailHeader}
  <div style="display: inline-block; background: #78350f; color: #f59e0b; font-size: 11px; font-weight: 800; padding: 4px 10px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
    ⚠️ Expiration Notice
  </div>
  <h2 style="color: #ffffff; font-size: 22px; font-weight: 800; margin-top: 0; margin-bottom: 12px;">Subscription Expiring in ${daysLeft} Day${daysLeft === 1 ? "" : "s"}</h2>
  <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
    Hello ${name}, your Sendport <strong>${planDisplay}</strong> plan subscription is scheduled to expire in <strong>${daysLeft} days</strong>.
  </p>
  <p style="color: #94a3b8; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
    To prevent any interruptions to your transactional emails and API dispatch limits, please renew your subscription or submit a payment slip in your billing dashboard.
  </p>

  <div style="text-align: center; margin: 28px 0 20px 0;">
    <a href="https://getsendport.com/dashboard/billing" style="background: #f59e0b; color: #0f172a; padding: 13px 28px; font-size: 14px; font-weight: 800; text-decoration: none; border-radius: 10px; display: inline-block;">
      Renew Subscription &rarr;
    </a>
  </div>
${emailFooter}
  `;

  return sendSystemEmail({
    to: user.email,
    subject: `⚠️ Reminder: Your Sendport ${planDisplay} subscription expires in ${daysLeft} days`,
    html,
  });
}

/**
 * 4. Password Reset Code Email
 */
export async function sendPasswordResetEmail(
  user: { email: string },
  recoveryCode: string
): Promise<boolean> {
  const html = `
${emailHeader}
  <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 12px;">Password Reset Request</h2>
  <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
    You requested a password reset for your Sendport account. Use the 6-digit verification code below to set a new password:
  </p>
  <div style="text-align: center; margin: 28px 0;">
    <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #38bdf8; background: #111827; border: 1px solid #1f2937; padding: 14px 28px; border-radius: 12px; display: inline-block;">${recoveryCode}</span>
  </div>
  <p style="color: #64748b; font-size: 12px; text-align: center; margin-bottom: 0;">
    This code expires in 15 minutes. If you did not request this, you can safely ignore this email.
  </p>
${emailFooter}
  `;

  return sendSystemEmail({
    to: user.email,
    subject: "Your Sendport Password Reset Code",
    html,
  });
}
