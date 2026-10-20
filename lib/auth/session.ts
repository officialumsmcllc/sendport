import crypto from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "sendport_session";

function getSessionSecret(): string {
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

// Module-level startup check in production
if (process.env.NODE_ENV === "production") {
  getSessionSecret();
}

export interface SessionPayload {
  userId: string;
  email: string;
  name?: string;
  role: string;
  exp: number;
}

export function createSessionToken(payload: Omit<SessionPayload, "exp">): string {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error(
      "Cannot create session: SESSION_SECRET is missing or shorter than 32 characters."
    );
  }
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const json = JSON.stringify(fullPayload);
  const data = Buffer.from(json).toString("base64url");
  const signature = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || !token.includes(".")) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, signature] = parts;
  if (!data || !signature) return null;

  const secret = getSessionSecret();
  if (!secret) return null; // Fail closed

  const expectedSig = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  if (signature !== expectedSig) {
    return null;
  }

  try {
    const json = Buffer.from(data, "base64url").toString("utf-8");
    const payload: SessionPayload = JSON.parse(json);
    if (payload.exp < Date.now()) return null; // expired
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(req?: any): Promise<SessionPayload | null> {
  let token: string | undefined;

  // 1. Direct NextRequest check if passed
  if (req?.cookies && typeof req.cookies.get === "function") {
    token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  }

  // 2. Cookie header parsing fallback
  if (!token && req?.headers && typeof req.headers.get === "function") {
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]*)`));
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }
  }

  // 3. Fallback to next/headers cookies() for Server Components & Actions
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    } catch (_) {}
  }

  if (!token) return null;
  return verifySessionToken(token);
}
