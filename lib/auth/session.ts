import crypto from "crypto";
import { cookies } from "next/headers";

const SECRET = process.env.SESSION_SECRET || "sendport_super_secure_session_secret_key_2026";
export const SESSION_COOKIE_NAME = "sendport_session";

export interface SessionPayload {
  userId: string;
  email: string;
  name?: string;
  role: string;
  exp: number;
}

export function createSessionToken(payload: Omit<SessionPayload, "exp">): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const json = JSON.stringify(fullPayload);
  const data = Buffer.from(json).toString("base64url");
  const signature = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  if (!token || !token.includes(".")) return null;
  const [data, signature] = token.split(".");
  const expectedSig = crypto.createHmac("sha256", SECRET).update(data).digest("base64url");
  if (signature !== expectedSig) return null;

  try {
    const json = Buffer.from(data, "base64url").toString("utf-8");
    const payload: SessionPayload = JSON.parse(json);
    if (payload.exp < Date.now()) return null; // expired
    return payload;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
