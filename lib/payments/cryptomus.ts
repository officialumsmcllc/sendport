
import crypto from "crypto";
import { getSetting } from "@/lib/settings/system-settings";

const CRYPTOMUS_API_BASE = "https://api.cryptomus.com/v1";

/**
 * Resolves Cryptomus credentials from Database (SystemSetting) with fallback to process.env
 */
export async function getCryptomusCredentials(): Promise<{
  merchantId: string;
  apiKey: string;
  isActive: boolean;
}> {
  try {
    const dbMerchantId = await getSetting("cryptomus_merchant_id", "");
    const dbApiKey = await getSetting("cryptomus_api_key", "");
    const dbIsActive = await getSetting("cryptomus_is_active", "true");

    const merchantId = (dbMerchantId || process.env.CRYPTOMUS_MERCHANT_ID || "").trim();
    const apiKey = (dbApiKey || process.env.CRYPTOMUS_API_KEY || "").trim();
    const isActive = dbIsActive !== "false";

    return { merchantId, apiKey, isActive };
  } catch (_) {
    return {
      merchantId: (process.env.CRYPTOMUS_MERCHANT_ID || "").trim(),
      apiKey: (process.env.CRYPTOMUS_API_KEY || "").trim(),
      isActive: true,
    };
  }
}

export interface CreateInvoiceParams {
  orderId: string;
  amount: string; // e.g. "20.00"
  currency?: string; // e.g. "USD"
  returnUrl: string;
  callbackUrl: string;
}

export interface CryptomusInvoiceResult {
  success: boolean;
  paymentUrl?: string;
  uuid?: string;
  orderId?: string;
  amount?: string;
  error?: string;
  isMock?: boolean;
}

/**
 * Generates Cryptomus MD5 signature:
 * md5(base64(JSON.stringify(data)) + API_KEY)
 */
export function generateCryptomusSignature(data: any, apiKey: string): string {
  const jsonString = typeof data === "string" ? data : JSON.stringify(data);
  const base64Data = Buffer.from(jsonString).toString("base64");
  const stringToSign = base64Data + apiKey;
  return crypto.createHash("md5").update(stringToSign).digest("hex");
}

/**
 * Validates incoming webhook signature from Cryptomus.
 * Handles both:
 * 1) Canonical Cryptomus format: sign is inside payload, calculated on JSON payload with 'sign' removed.
 * 2) Header format: sign header calculated on raw body or stripped payload.
 */
export function verifyCryptomusWebhookSignature(
  rawBody: string,
  incomingSignature: string,
  apiKey: string
): boolean {
  if (!apiKey) return false;
  try {
    let signatureToMatch = incomingSignature?.trim().toLowerCase();

    // Try parsing JSON to extract sign from body if not supplied in header
    let parsed: any = null;
    try {
      parsed = JSON.parse(rawBody);
      if (!signatureToMatch && parsed?.sign) {
        signatureToMatch = String(parsed.sign).trim().toLowerCase();
      }
    } catch (_) {}

    if (!signatureToMatch) return false;

    // Check Case 1: Body with 'sign' removed (official Cryptomus spec)
    if (parsed && typeof parsed === "object") {
      const clone = { ...parsed };
      delete clone.sign;
      const jsonWithoutSign = JSON.stringify(clone);
      const sign1 = generateCryptomusSignature(jsonWithoutSign, apiKey).toLowerCase();
      if (sign1 === signatureToMatch) {
        return true;
      }
    }

    // Check Case 2: Raw body string
    const sign2 = generateCryptomusSignature(rawBody, apiKey).toLowerCase();
    if (sign2 === signatureToMatch) {
      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Creates a Cryptomus payment invoice
 */
export async function createCryptomusInvoice(
  params: CreateInvoiceParams
): Promise<CryptomusInvoiceResult> {
  const { merchantId, apiKey, isActive } = await getCryptomusCredentials();

  if (!isActive) {
    return {
      success: false,
      error: "Cryptomus payment gateway is temporarily disabled by platform administrator.",
    };
  }

  // If credentials are not configured yet, return a safe sandbox invoice URL
  if (!merchantId || !apiKey) {
    console.warn(
      "[CRYPTOMUS WARNING]: Missing CRYPTOMUS_MERCHANT_ID or CRYPTOMUS_API_KEY. Operating in Sandbox Simulation mode."
    );
    return {
      success: true,
      uuid: `mock_cm_${Date.now()}`,
      orderId: params.orderId,
      amount: params.amount,
      paymentUrl: `${params.returnUrl}${params.returnUrl.includes("?") ? "&" : "?"}cryptomus_mock=true&orderId=${params.orderId}`,
      isMock: true,
    };
  }

  const payload = {
    amount: params.amount,
    currency: params.currency || "USD",
    order_id: params.orderId,
    url_return: params.returnUrl,
    url_callback: params.callbackUrl,
    is_payment_multiple: false,
    lifetime: 7200, // 2 hours
  };

  const sign = generateCryptomusSignature(payload, apiKey);

  try {
    const res = await fetch(`${CRYPTOMUS_API_BASE}/payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        merchant: merchantId,
        sign,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || (data.state !== undefined && data.state !== 0)) {
      const errMsg = data.message || data.error || `HTTP ${res.status}: ${res.statusText}`;
      console.error("[CRYPTOMUS_INVOICE_FAILED]:", errMsg, data);
      return {
        success: false,
        error: `Cryptomus Error: ${errMsg}`,
      };
    }

    const result = data.result || {};
    return {
      success: true,
      paymentUrl: result.url,
      uuid: result.uuid,
      orderId: result.order_id,
      amount: result.amount,
    };
  } catch (err: any) {
    console.error("[CRYPTOMUS_REQUEST_ERR]:", err);
    return {
      success: false,
      error: `Failed to connect to Cryptomus Gateway: ${err.message}`,
    };
  }
}
