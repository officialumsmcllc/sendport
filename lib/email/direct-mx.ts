import dns from "dns/promises";
import nodemailer from "nodemailer";

interface DirectMxOptions {
  from: string;
  to: string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  headers?: Record<string, string>;
  messageId: string;
  dkimSignatureHeader?: string;
}

/**
 * Resolves the lowest-priority (best) MX host for a domain
 */
export async function getBestMxHost(domain: string): Promise<string | null> {
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return null;
    }
    // Sort by priority ascending (lowest number = highest priority)
    mxRecords.sort((a, b) => a.priority - b.priority);
    return mxRecords[0].exchange;
  } catch (err) {
    console.warn(`[DNS MX LOOKUP FAILED] for ${domain}:`, err);
    return null;
  }
}

/**
 * Dispatches email directly to recipient's Mail Exchange (MX) server
 * without requiring any 3rd party SMTP relay login!
 */
export async function dispatchDirectToMx(options: DirectMxOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const firstRecipient = options.to[0];
    const recipientDomain = firstRecipient.split("@")[1]?.toLowerCase();

    if (!recipientDomain) {
      return { success: false, error: "Invalid recipient email address domain." };
    }

    // 1. Resolve Recipient MX Host (e.g. gmail-smtp-in.l.google.com)
    const mxHost = await getBestMxHost(recipientDomain);
    if (!mxHost) {
      return { success: false, error: `No MX records found for domain ${recipientDomain}` };
    }

    console.log(`[DIRECT MX DISPATCH] Routing email to MX ${mxHost} for ${firstRecipient}`);

    // 2. Connect directly to recipient MX server on standard SMTP port 25
    const transporter = nodemailer.createTransport({
      host: mxHost,
      port: 25,
      secure: false, // Direct MX uses opportunistic STARTTLS
      name: "mail.getsendport.com",
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });

    // 3. Deliver DKIM signed RFC5322 MIME message
    await transporter.sendMail({
      from: options.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      replyTo: options.replyTo,
      headers: {
        "Message-ID": `<${options.messageId}@getsendport.com>`,
        ...(options.dkimSignatureHeader ? { "DKIM-Signature": options.dkimSignatureHeader } : {}),
        ...options.headers,
      },
    });

    console.log(`[DIRECT MX SUCCESS] Delivered directly to ${mxHost}`);
    return { success: true };
  } catch (err: any) {
    console.warn(`[DIRECT MX FALLBACK/NOTICE] Port 25 direct send notice:`, err.message);
    return { success: false, error: err.message };
  }
}
