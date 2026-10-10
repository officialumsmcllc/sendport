export const SESSION_COOKIE_NAME = "sendport_session";

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (
    process.env.NODE_ENV === "production" &&
    (!secret || secret === "sendport_super_secure_session_secret_key_2026")
  ) {
    console.warn(
      "[SECURITY ALERT] SESSION_SECRET is not set or using the default key in production! Set a high-entropy SESSION_SECRET in your environment variables immediately."
    );
  }
  return secret || "sendport_super_secure_session_secret_key_2026";
}

const SECRET = getSessionSecret();

export interface SessionPayload {
  userId: string;
  email: string;
  name?: string;
  role: string;
  exp: number;
}

/**
 * Edge-compatible session verifier using Web Crypto API.
 * Works natively in Next.js Middleware, Edge functions, and Node runtime.
 */
export async function verifySessionEdge(token: string): Promise<SessionPayload | null> {
  if (!token || !token.includes(".")) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, signature] = parts;
  if (!data || !signature) return null;

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
    const bytes = new Uint8Array(signatureBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {33
      binary += String.fromCharCode(bytes[i]);
    }
    const expectedSig = btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    if (signature !== expectedSig) return null;

    // Decode base64url data
    let base64 = data.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    const jsonStr = atob(base64);
    const payload: SessionPayload = JSON.parse(jsonStr);

    if (payload.exp && payload.exp < Date.now()) return null; // expired
    return payload;
  } catch {
    return null;
  }
}
