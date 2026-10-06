/**
 * Sendport Cloudflare Edge Mailer Loophole Worker
 * Bypasses cloud Port 25 blocking by routing encrypted email payloads over Port 443 HTTPS.
 * 
 * Free Deployment Instructions:
 * 1. Go to dash.cloudflare.com -> Workers & Pages -> Create Application -> Create Worker.
 * 2. Paste this entire code into the worker script.
 * 3. Click "Deploy".
 * 4. Copy the Worker URL (e.g. https://sendport-edge-mailer.<your-subdomain>.workers.dev).
 * 5. Add to Render Environment: CLOUDFLARE_WORKER_URL = "https://your-worker.workers.dev"
 */

export default {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Sendport-Key",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed. Use POST." }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const authHeader = request.headers.get("X-Sendport-Key") || request.headers.get("Authorization");
      const expectedKey = env.SENDPORT_SECRET || "sendport_edge_master_key_2026";

      if (authHeader && authHeader.replace("Bearer ", "") !== expectedKey) {
        return new Response(JSON.stringify({ error: "Unauthorized access" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const body = await request.json();
      const {
        from_address,
        to_addresses,
        subject,
        html,
        text,
        reply_to,
        dkim_domain,
        dkim_private_key,
        dkim_selector,
      } = body;

      const recipients = Array.isArray(to_addresses) ? to_addresses : [to_addresses];

      let senderEmail = from_address;
      let senderName = "Sendport Mailer";

      if (from_address.includes("<")) {
        const match = from_address.match(/(?:(.*?)<)?([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})>?/);
        if (match) {
          senderName = match[1]?.trim().replace(/^["']|["']$/g, "") || senderName;
          senderEmail = match[2].trim();
        }
      }

      const mcPayload = {
        personalizations: [
          {
            to: recipients.map((r) => ({ email: r, name: r.split("@")[0] })),
            ...(dkim_domain && dkim_private_key
              ? {
                  dkim_domain: dkim_domain,
                  dkim_private_key: dkim_private_key,
                  dkim_selector: dkim_selector || "sendport",
                }
              : {}),
          },
        ],
        from: {
          email: senderEmail,
          name: senderName,
        },
        subject: subject,
        content: [
          {
            type: "text/html",
            value: html || text || "<p>Notification from Sendport</p>",
          },
        ],
      };

      if (reply_to) {
        mcPayload.reply_to = { email: reply_to };
      }

      // Handshake to MailChannels Edge Cluster on Cloudflare
      const res = await fetch("https://api.mailchannels.net/tx/v1/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mcPayload),
      });

      if (res.status === 200 || res.status === 202) {
        return new Response(
          JSON.stringify({ success: true, message: "Dispatched to global inbox via Cloudflare Edge Loophole" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      } else {
        const errorText = await res.text();
        return new Response(JSON.stringify({ success: false, error: errorText, status: res.status }), {
          status: res.status,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (e) {
      return new Response(JSON.stringify({ success: false, error: e.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
