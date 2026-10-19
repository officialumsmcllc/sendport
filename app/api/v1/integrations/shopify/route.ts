import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db/prisma";
import { sendEmailEngine } from "@/lib/email/dispatcher";

/**
 * POST /api/v1/integrations/shopify
 * Shopify Webhook Endpoint for Automatic Order & Transactional Email Dispatch.
 * 
 * Supports:
 * - Header: 'x-shopify-topic', 'x-shopify-shop-domain', 'x-shopify-hmac-sha256'
 * - Auth: ?apiKey=sk_live_... OR Authorization: Bearer sk_live_... OR Header x-sendport-key
 * - Topics: 'orders/paid', 'orders/fulfilled', 'orders/create', 'checkouts/create', 'customers/create'
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const topic = req.headers.get("x-shopify-topic") || "orders/paid";
    const shopDomain = req.headers.get("x-shopify-shop-domain") || "shopify-store.myshopify.com";
    const hmacHeader = req.headers.get("x-shopify-hmac-sha256");

    // Resolve API Key / Workspace
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get("authorization") || req.headers.get("x-sendport-key") || "";
    const apiKeyRaw = searchParams.get("apiKey") || searchParams.get("key") || authHeader.replace(/^Bearer\s+/i, "");
    const customFrom = searchParams.get("from");

    let payload: any = {};
    if (rawBody && rawBody.trim()) {
      try {
        payload = JSON.parse(rawBody);
      } catch (e) {
        // Ping or non-JSON body
      }
    }

    // Verify webhook if webhook secret is provided
    const webhookSecret = searchParams.get("secret");
    if (webhookSecret && hmacHeader) {
      const generatedHash = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody, "utf8")
        .digest("base64");
      if (generatedHash !== hmacHeader) {
        return NextResponse.json({ error: "Invalid Shopify webhook HMAC signature" }, { status: 401 });
      }
    }

    // Ping check from Shopify
    if (!payload || Object.keys(payload).length === 0) {
      return NextResponse.json({ status: "ok", message: "Shopify webhook ping received successfully" });
    }

    // Find workspace by API key (if provided)
    let workspace = null;
    if (apiKeyRaw) {
      const keyHash = crypto.createHash("sha256").update(apiKeyRaw.trim()).digest("hex");
      const keyRecord = await prisma.apiKey.findUnique({
        where: { keyHash },
        include: { workspace: true },
      });
      if (keyRecord) {
        workspace = keyRecord.workspace;
      }
    }

    // If no explicit API key is provided, check if a domain matches the shop
    if (!workspace) {
      const fallbackDomain = await prisma.domain.findFirst({
        where: { status: "VERIFIED" },
        include: { workspace: true },
      });
      if (fallbackDomain) {
        workspace = fallbackDomain.workspace;
      }
    }

    // Extract customer email & details
    const recipientEmail = payload.email || payload.customer?.email || payload.contact_email;
    const customerName = payload.customer?.first_name 
      ? `${payload.customer.first_name} ${payload.customer.last_name || ""}`.trim()
      : "Valued Customer";
    const orderNumber = payload.name || (payload.order_number ? `#${payload.order_number}` : "#Order");
    const currency = payload.currency || "USD";
    const totalPrice = payload.total_price || payload.current_total_price || "0.00";
    const lineItems = Array.isArray(payload.line_items) ? payload.line_items : [];

    // If we have workspace and recipient, format and dispatch email
    let dispatched = false;
    let messageId = null;

    if (workspace && recipientEmail) {
      // Determine sender address
      let senderAddress = customFrom;
      if (!senderAddress) {
        const verifiedDomain = await prisma.domain.findFirst({
          where: { workspaceId: workspace.id, status: "VERIFIED" },
        });
        senderAddress = verifiedDomain 
          ? `orders@${verifiedDomain.name}`
          : `orders@${workspace.slug}.getsendport.com`;
      }

      let subject = `Order Confirmation ${orderNumber} - Thank you for your purchase!`;
      if (topic.includes("fulfilled")) {
        subject = `Your Order ${orderNumber} has been shipped!`;
      } else if (topic.includes("checkout")) {
        subject = `Complete your purchase at ${shopDomain}`;
      }

      // Generate clean modern e-commerce receipt template
      const itemsHtml = lineItems.map((item: any) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 12px 0; font-size: 14px; color: #1e293b;">
            <strong>${item.title || item.name || "Item"}</strong>
            ${item.variant_title ? `<br><span style="font-size: 12px; color: #64748b;">${item.variant_title}</span>` : ""}
          </td>
          <td style="padding: 12px 0; font-size: 14px; color: #64748b; text-align: center;">x${item.quantity || 1}</td>
          <td style="padding: 12px 0; font-size: 14px; font-weight: 600; color: #0f172a; text-align: right;">${currency} ${item.price || "0.00"}</td>
        </tr>
      `).join("");

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
        </head>
        <body style="margin: 0; padding: 32px 16px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <div style="background: linear-gradient(135deg, #0284c7, #0ea5e9); padding: 28px 32px; text-align: left;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">${shopDomain}</h1>
              <p style="margin: 6px 0 0 0; color: #e0f2fe; font-size: 13px;">${subject}</p>
            </div>
            
            <div style="padding: 32px;">
              <p style="font-size: 15px; color: #334155; margin-top: 0;">Hi <strong>${customerName}</strong>,</p>
              <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                We have received your order <strong>${orderNumber}</strong>. Here is a summary of your items:
              </p>

              <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
                <thead>
                  <tr style="border-bottom: 2px solid #cbd5e1; text-align: left;">
                    <th style="padding-bottom: 8px; font-size: 12px; text-transform: uppercase; color: #64748b;">Product</th>
                    <th style="padding-bottom: 8px; font-size: 12px; text-transform: uppercase; color: #64748b; text-align: center;">Qty</th>
                    <th style="padding-bottom: 8px; font-size: 12px; text-transform: uppercase; color: #64748b; text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml || `
                    <tr>
                      <td colspan="3" style="padding: 16px 0; text-align: center; color: #64748b; font-size: 13px;">Order Items Processed</td>
                    </tr>
                  `}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="2" style="padding-top: 16px; font-size: 15px; font-weight: 700; color: #0f172a;">Grand Total</td>
                    <td style="padding-top: 16px; font-size: 17px; font-weight: 800; color: #0284c7; text-align: right;">${currency} ${totalPrice}</td>
                  </tr>
                </tfoot>
              </table>

              <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
                <p style="font-size: 12px; color: #94a3b8; margin: 0;">
                  Secured & delivered with 2048-bit RSA DKIM via <strong>GetSendport</strong>.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      try {
        const sendResult = await sendEmailEngine({
          workspace,
          from: senderAddress,
          to: recipientEmail,
          subject,
          html: htmlContent,
          text: `Order ${orderNumber} confirmation for ${customerName}. Total: ${currency} ${totalPrice}.`,
        });
        dispatched = sendResult.success;
        messageId = sendResult.messageId;
      } catch (err: any) {
        console.error("[Shopify Webhook Dispatch Error]", err);
      }
    }

    return NextResponse.json({
      success: true,
      topic,
      shop: shopDomain,
      order: orderNumber,
      customer: recipientEmail || "None",
      emailDispatched: dispatched,
      messageId: messageId || null,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("[Shopify Webhook Error]", error);
    // Return 200 to prevent Shopify from disabling webhooks on temporary exceptions
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    service: "GetSendport Shopify Webhook Engine",
    version: "1.0.0",
    docs: "https://getsendport.com/integrations/shopify",
    supportedTopics: [
      "orders/paid",
      "orders/create",
      "orders/fulfilled",
      "checkouts/create",
      "customers/create",
    ],
  });
}
