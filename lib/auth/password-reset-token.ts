import crypto from "crypto";

const RESET_SECRET = process.env.SESSION_SECRET || "sendport_reset_secret_key_2026";

export interface PasswordResetPayload {
  email: string;
  code: string;
  exp: number; // Expiration timestamp in ms
}

/**
 * Creates a cryptographically signed HMAC-SHA256 password reset token.
 * Valid for 15 minutes.
 */
export function createPasswordResetToken(email: string, code: string): string {
  const payload: PasswordResetPayload = {
    email: email.toLowerCase().trim(),
    code: code.trim(),
    exp: Date.now() + 15 * 60 * 1000, // 15 minutes
  };

  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", RESET_SECRET)
    .update(data)
    .digest("base64url");

  return `${data}.${signature}`;
}

/**
 * Verifies the validity, signature, and expiration of a password reset token.
 */
export function verifyPasswordResetToken(
  token: string,
  email: string,
  code?: string
): boolean {
  if (!token || !token.includes(".")) return false;

  const [data, signature] = token.split(".");
  if (!data || !signature) return false;

  const expectedSig = crypto
    .createHmac("sha256", RESET_SECRET)
    .update(data)
    .digest("base64url");

  if (signature !== expectedSig) return false;

  try {
    const json = Buffer.from(data, "base64url").toString("utf-8");
    const payload: PasswordResetPayload = JSON.parse(json);

    // Verify expiration
    if (payload.exp < Date.now()) return false;

    // Verify email alignment
    if (payload.email !== email.toLowerCase().trim()) return false;

    // Verify recovery code if provided
    if (code && payload.code !== code.trim()) return false;

    return true;
  } catch {
    return false;
  }
}
