import crypto from "crypto";

/**
 * Hash a password using PBKDF2 with a random salt.
 * Format: salt:hash
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

/**
 * Verify a plain password against a stored salt:hash string.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, originalHash] = storedHash.split(":");
  const computedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return crypto.timingSafeEqual(Buffer.from(originalHash, "hex"), Buffer.from(computedHash, "hex"));
}
