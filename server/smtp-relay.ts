import { SMTPServer, SMTPServerAuthentication, SMTPServerAuthenticationResponse, SMTPServerSession } from "smtp-server";
import { simpleParser, ParsedMail } from "mailparser";
import { prisma } from "../lib/db/prisma";
import { sendEmailEngine, parseFromHeader } from "../lib/email/dispatcher";

const SMTP_PORT = parseInt(process.env.SMTP_SERVER_PORT || "2525", 10);
const SMTP_HOST = process.env.SMTP_SERVER_HOST || "0.0.0.0";

/**
 * Sendport Enterprise SMTP Relay Server
 * Listens for inbound SMTP connections from WordPress, Laravel, Django, Node.js, PHP, etc.
 * Authenticates using Sendport API Key (sk_live_...) as password.
 */
export function createSendportSmtpServer() {
  const server = new SMTPServer({
    name: "smtp.getsendport.com",
    banner: "Sendport Enterprise ESMTP Delivery Relay (getsendport.com)",
    size: 35 * 1024 * 1024, // 35MB max message size
    authMethods: ["PLAIN", "LOGIN"],
    disabledCommands: [],
    authOptional: false, // Force authentication

    // 1. Authenticate SMTP Client via Sendport API Key
    async onAuth(
      auth: SMTPServerAuthentication,
      session: SMTPServerSession,
      callback: (err: Error | null, response?: SMTPServerAuthenticationResponse) => void
    ) {
      try {
        const password = auth.password || "";
        const username = auth.username || "";

        // API Key can be passed as password (e.g. Username: "api", Password: "sk_live_...")
        // Or if username starts with sk_live_
        const rawApiKey = password.startsWith("sk_live_") ? password : username.startsWith("sk_live_") ? username : password;

        if (!rawApiKey) {
          return callback(new Error("Missing API Key. Use your 'sk_live_...' key as the SMTP password."));
        }

        const apiKey = await prisma.apiKey.findFirst({
          where: {
            OR: [
              { keyHash: rawApiKey },
              { keyPrefix: { startsWith: rawApiKey.substring(0, 12) } },
            ],
          },
          include: {
            workspace: true,
          },
        });

        if (!apiKey || !apiKey.workspace) {
          console.warn(`[SMTP AUTH FAILED] Invalid API key attempt from ${session.remoteAddress}`);
          return callback(new Error("535 5.7.8 Authentication credentials invalid. Please check your Sendport API Key."));
        }

        // Check daily quota
        const workspace = apiKey.workspace;
        if (workspace.usedToday >= workspace.dailyQuota) {
          return callback(new Error("452 4.4.5 Daily email quota exceeded for your workspace. Please upgrade your plan."));
        }

        // Authentication successful
        return callback(null, {
          user: {
            workspaceId: workspace.id,
            apiKeyId: apiKey.id,
            workspaceName: workspace.name,
          } as any,
        });
      } catch (err: any) {
        console.error("[SMTP AUTH ERROR]", err);
        return callback(new Error("451 4.3.0 Internal authentication error."));
      }
    },

    // 2. Process incoming Email Message Stream
    async onData(stream, session, callback) {
      try {
        const user = session.user as any;
        const workspaceId = user?.workspaceId;

        if (!workspaceId) {
          return callback(new Error("530 5.7.0 Authentication required."));
        }

        // Parse RFC5322 MIME stream
        const parsed: ParsedMail = await simpleParser(stream);

        const envelopeFrom = session.envelope.mailFrom ? session.envelope.mailFrom.address : "sender@getsendport.com";
        const fromAddress = parsed.from?.text || envelopeFrom;
        const toAddresses = (parsed.to
          ? Array.isArray(parsed.to)
            ? parsed.to.map((t) => t.text)
            : [parsed.to.text]
          : session.envelope.rcptTo.map((r) => r.address)
        ).filter(Boolean);


        const subject = parsed.subject || "(No Subject)";
        const html = parsed.html || (parsed.text ? `<p>${parsed.text.replace(/\n/g, "<br/>")}</p>` : "");
        const text = parsed.text || "";

        // Process attachments if any
        const attachments = (parsed.attachments || []).map((att) => ({
          filename: att.filename || "attachment",
          content: att.content.toString("base64"),
          contentType: att.contentType,
        }));

        // Dispatch through Sendport Delivery Engine (Signs DKIM + Injects Tracking + Logs)
        const result = await sendEmailEngine({
          workspaceId,
          from: fromAddress,
          to: toAddresses,
          subject,
          html,
          text,
          replyTo: parsed.replyTo?.text,
          trackOpens: true,
          trackClicks: true,
          attachments: attachments.length > 0 ? attachments : undefined,
        });

        console.log(`[SMTP RELAY DELIVERED] Message ${result.id} dispatched for ${workspaceId} to ${toAddresses.join(", ")}`);
        return callback(null, `250 2.0.0 OK: Message accepted for delivery as ${result.id}`);
      } catch (err: any) {
        console.error("[SMTP PROCESS ERROR]", err);
        return callback(new Error(`451 4.3.0 Failed to process email: ${err.message}`));
      }
    },
  });

  server.on("error", (err) => {
    console.error("[SMTP SERVER ERROR]", err);
  });

  return server;
}

// Start standalone SMTP server if executed directly
if (require.main === module) {
  const server = createSendportSmtpServer();
  server.listen(SMTP_PORT, SMTP_HOST, () => {
    console.log(`🚀 Sendport Enterprise SMTP Relay Server listening on ${SMTP_HOST}:${SMTP_PORT}`);
  });
}
