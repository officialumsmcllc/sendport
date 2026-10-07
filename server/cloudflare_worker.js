/**
 * Sendport Cloudflare Edge Email Dispatcher
 * Dispatches high-deliverability emails via Cloudflare Edge Network & MailChannels Gateway
 */

export default {
  async fetch(request, env, ctx) {
    // 1. CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, X-Sendport-Key, Authorization",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Authentication Check
    const authHeader = request.headers.get("X-Sendport-Key") || request.headers.get("Authorization");
    const secretKey = env.SENDPORT_SECRET || "sendport_edge_master_key_2026";

    if (!authHeader || (!authHeader.includes(secretKey) && authHeader !== `Bearer ${secretKey}`)) {
      return new Response(JSON.stringify({ error: "Unauthorized access to Sendport Edge" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 3. Parse Email Payload
    try {
      const payload = await request.json();
      const {
        from_address,
        to_addresses,
        subject,
        html,
        text,
        reply_to,
        headers = {},
      } = payload;

      if (!from_address || !to_addresses || !subject) {
        return new Response(
          JSON.stringify({ error: "Missing required fields: from_address, to_addresses, subject" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Parse From Header
      let fromEmail = from_address;
      let fromName = "Sendport";
      const fromMatch = from_address.match(/(?:(.*?)<)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/);
      if (fromMatch) {
        fromName = fromMatch[1]?.trim().replace(/^["']|["']$/g, "") || "Sendport";
        fromEmail = fromMatch[2].trim();
      }

      const recipients = Array.isArray(to_addresses) ? to_addresses : [to_addresses];
      const toPersonalizations = recipients.map((email) => {
        const match = email.match(/(?:(.*?)<)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/);
        return {
          email: match ? match[2].trim() : email.trim(),
          name: match && match[1] ? match[1].trim().replace(/^["']|["']$/g, "") : undefined,
        };
      });

      // Prepare MailChannels Edge Payload
      const mailchannelsPayload = {
        personalizations: [
          {
            to: toPersonalizations,
          },
        ],
        from: {
          email: fromEmail,
          name: fromName,
        },
        subject: subject,
        content: [
          ...(html ? [{ type: "text/html", value: html }] : []),
          ...(text ? [{ type: "text/plain", value: text }] : []),
        ],
        headers: headers,
      };

      if (reply_to) {
        mailchannelsPayload.reply_to = {
          email: reply_to.replace(/.*<([^>]+)>.*/, "$1").trim(),
        };
      }

      // Dispatch to MailChannels API from Cloudflare Edge
      const mcResponse = await fetch("https://api.mailchannels.net/tx/v1/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Sendport-Edge-Worker/1.0",
        },
        body: JSON.stringify(mailchannelsPayload),
      });

      const respStatus = mcResponse.status;
      const respText = await mcResponse.text();

      if (respStatus >= 200 && respStatus < 300) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "Dispatched successfully via Cloudflare Edge Network",
            status_code: respStatus,
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      } else {
        return new Response(
          JSON.stringify({
            success: false,
            error: `Edge MailChannels rejected: ${respText}`,
            status_code: respStatus,
          }),
          {
            status: respStatus,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        );
      }
    } catch (err) {
      return new Response(
        JSON.stringify({ success: false, error: err.message }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }
  },
};
