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
 * Resolves all MX hosts for a domain sorted by priority
 */
export async function getAllMxHosts(domain: string): Promise<string[]> {
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return [];
    }
    // Sort by priority ascending (lowest number = highest priority)
    mxRecords.sort((a, b) => a.priority - b.priority);
    return mxRecords.map((r) => r.exchange);
  } catch (err) {
    console.warn(`[DNS MX LOOKUP FAILED] for ${domain}:`, err);
    return [];
  }
}

/**
 * Resolves the lowest-priority (best) MX host for a domain
 */
export async function getBestMxHost(domain: string): Promise<string | null> {
  const hosts = await getAllMxHosts(domain);
  return hosts[0] || null;
}

/**
 * Dispatches email directly to recipient's Mail Exchange (MX) server
 * directly from Render without requiring any 3rd party SMTP relay login!
 */
export async function dispatchDirectToMx(options: DirectMxOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const firstRecipient = options.to[0];
    const recipientDomain = firstRecipient.split("@")[1]?.toLowerCase();

    if (!recipientDomain) {
      return { success: false, error: "Invalid recipient email address domain." };
    }

    // 1. Resolve Recipient MX Hosts
    const mxHosts = await getAllMxHosts(recipientDomain);
    if (!mxHosts || mxHosts.length === 0) {
      return { success: false, error: `No MX records found for domain ${recipientDomain}` };
    }

    console.log(`[DIRECT MX DISPATCH] Found ${mxHosts.length} MX host(s) for ${recipientDomain}: ${mxHosts.join(", ")}`);

    let lastError = "";

    // 2. Iterate through MX servers until one successfully accepts the email
    for (const mxHost of mxHosts.slice(0, 3)) {
      try {
        console.log(`[DIRECT MX DISPATCH] Attempting direct Port 25 connection to ${mxHost}...`);

        const transporter = nodemailer.createTransport({
          host: mxHost,
          port: 25,
          secure: false, // Opportunistic STARTTLS
          name: "getsendport.com",
          family: 4, // Force IPv4 to avoid IPv6 cloud blackholes
          tls: {
            rejectUnauthorized: false,
            minVersion: "TLSv1.2",
          },
          connectionTimeout: 8000,
          greetingTimeout: 8000,
          socketTimeout: 12000,
        } as any);

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

        console.log(`[DIRECT MX SUCCESS] Delivered directly from Render to ${mxHost}`);
        return { success: true };
      } catch (attemptErr: any) {
        lastError = attemptErr.message || "Unknown error";
        console.warn(`[DIRECT MX ATTEMPT FAILED] for ${mxHost}:`, lastError);
      }
    }

    return { success: false, error: lastError || "All MX host connection attempts failed." };
  } catch (err: any) {
    console.warn(`[DIRECT MX NOTICE]:`, err.message);
    return { success: false, error: err.message };
  }
}

