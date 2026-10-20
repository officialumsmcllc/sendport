import crypto from "crypto";

function getResetSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL: SESSION_SECRET is missing or shorter than 32 characters in production. Failing closed."
      );
    }
    return "";
  }
  return secret;
}

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
  const secret = getResetSecret();
  if (!secret) {
    throw new Error("Cannot create reset token: SESSION_SECRET is missing or invalid.");
  }

  const payload: PasswordResetPayload = {
    email: email.toLowerCase().trim(),
    code: code.trim(),
    exp: Date.now() + 15 * 60 * 1000, // 15 minutes
  };

  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
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

  const secret = getResetSecret();
  if (!secret) return false; // Fail closed

  const expectedSig = crypto
    .createHmac("sha256", secret)
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

    // If code is provided for verification, ensure match
    if (code && payload.code !== code.trim()) return false;

    return true;
  } catch {
    return false;
  }
}
