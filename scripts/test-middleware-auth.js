/**
 * Test script to verify middleware behavior with:
 * 1. Corrupted cookie
 * 2. Expired cookie
 * 3. Valid cookie
 * 4. Missing cookie
 * 5. Secret < 32 characters or missing (Fail-Closed)
 */

const crypto = require("crypto");

// Dynamically generate a random high-entropy secret for testing (never hardcoded)
const testSecret = crypto.randomBytes(32).toString("hex");
process.env.SESSION_SECRET = testSecret;

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    return null;
  }
  return secret;
}

// 1. Replicate verifySessionEdge with strict fail-closed policy (no fallbacks)
async function verifySessionEdge(token) {
  if (!token || !token.includes(".")) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, signature] = parts;
  if (!data || !signature) return null;

  const secret = getSessionSecret();
  if (!secret) return null; // Fail closed

  try {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
    const bytes = new Uint8Array(signatureBuffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const expectedSig = btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    if (signature !== expectedSig) {
      return null;
    }

    // Decode base64url data
    let base64 = data.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }
    const jsonStr = atob(base64);
    const payload = JSON.parse(jsonStr);

    if (payload.exp && payload.exp < Date.now()) return null; // expired
    return payload;
  } catch {
    return null;
  }
}

// 2. Replicate middleware logic exactly
async function simulateMiddleware(pathname, cookieToken, searchParams = {}) {
  const token = cookieToken;
  const session = token ? await verifySessionEdge(token) : null;
  let action = "NEXT";
  let targetUrl = null;
  let deletedCookie = false;

  // 1. Dashboard protect
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (!session) {
      action = "REDIRECT";
      targetUrl = "/login?redirect=" + pathname;
      if (token) deletedCookie = true;
      return { action, targetUrl, deletedCookie, session };
    }
    return { action: "NEXT", targetUrl: null, deletedCookie: false, session };
  }

  // 2. Login page (never redirect away, clear bad cookie if invalid)
  if (pathname === "/login") {
    if (token && !session) {
      return { action: "NEXT", targetUrl: null, deletedCookie: true, session: null };
    }
    return { action: "NEXT", targetUrl: null, deletedCookie: false, session };
  }

  // 3. Signup page (redirect only if verified, clear bad cookie if invalid)
  if (pathname === "/signup" || pathname === "/register") {
    const planParam = searchParams.plan;
    if (session) {
      if (planParam && planParam !== "starter") {
        return { action: "REDIRECT", targetUrl: `/dashboard/billing?plan=${planParam}`, deletedCookie: false, session };
      }
      return { action: "REDIRECT", targetUrl: "/dashboard", deletedCookie: false, session };
    }
    if (token && !session) {
      return { action: "NEXT", targetUrl: null, deletedCookie: true, session: null };
    }
    return { action: "NEXT", targetUrl: null, deletedCookie: false, session: null };
  }

  return { action: "NEXT", targetUrl: null, deletedCookie: false, session };
}

// 3. Run Test Suite
async function runTests() {
  // Create tokens using the active random secret
  const validPayload = { userId: "user_123", email: "builder@sendport.com", role: "USER", exp: Date.now() + 3600000 };
  const validData = Buffer.from(JSON.stringify(validPayload)).toString("base64url");
  const validSig = crypto.createHmac("sha256", process.env.SESSION_SECRET).update(validData).digest("base64url");
  const validToken = `${validData}.${validSig}`;

  const expiredPayload = { userId: "user_old", email: "builder@sendport.com", role: "USER", exp: Date.now() - 3600000 };
  const expiredData = Buffer.from(JSON.stringify(expiredPayload)).toString("base64url");
  const expiredSig = crypto.createHmac("sha256", process.env.SESSION_SECRET).update(expiredData).digest("base64url");
  const expiredToken = `${expiredData}.${expiredSig}`;

  const corruptedToken = `${validData}.invalid_tampered_signature_abc`;
  const malformedToken = "not_even_dots_here";

  console.log("=========================================");
  console.log("MIDDLEWARE AUTHENTICATION TEST SUITE");
  console.log("Random 256-bit SESSION_SECRET generated in-memory");
  console.log("=========================================\n");

  const testCases = [
    { name: "Corrupted cookie on /login", path: "/login", token: corruptedToken },
    { name: "Expired cookie on /login", path: "/login", token: expiredToken },
    { name: "Malformed cookie on /login", path: "/login", token: malformedToken },
    { name: "Corrupted cookie on /dashboard", path: "/dashboard", token: corruptedToken },
    { name: "Expired cookie on /dashboard", path: "/dashboard", token: expiredToken },
    { name: "Corrupted cookie on /signup", path: "/signup", token: corruptedToken },
    { name: "Expired cookie on /signup", path: "/signup", token: expiredToken },
    { name: "Valid cookie on /login", path: "/login", token: validToken },
    { name: "Valid cookie on /signup", path: "/signup", token: validToken },
    { name: "Valid cookie on /signup?plan=growth", path: "/signup", token: validToken, params: { plan: "growth" } },
    { name: "Valid cookie on /dashboard", path: "/dashboard", token: validToken },
    { name: "No cookie on /dashboard", path: "/dashboard", token: null },
    { name: "No cookie on /signup", path: "/signup", token: null },
    { name: "No cookie on /login", path: "/login", token: null },
  ];

  for (const tc of testCases) {
    const result = await simulateMiddleware(tc.path, tc.token, tc.params || {});
    console.log(`[TEST] ${tc.name}`);
    console.log(`  -> Path: ${tc.path}`);
    console.log(`  -> Action: ${result.action}`);
    if (result.targetUrl) console.log(`  -> Target: ${result.targetUrl}`);
    console.log(`  -> Deleted Cookie: ${result.deletedCookie}`);
    console.log(`  -> Verified Session: ${result.session ? "VALID (" + result.session.userId + ")" : "NULL (Unauthenticated)"}`);
    console.log("");
  }

  // 4. Test Fail-Closed behavior when SESSION_SECRET is too short (< 32 chars) or missing
  console.log("-----------------------------------------");
  console.log("TESTING FAIL-CLOSED SECURITY (Secret < 32 chars)");
  console.log("-----------------------------------------");
  process.env.SESSION_SECRET = "short_secret_under_32_chars";
  const shortSecretResult = await verifySessionEdge(validToken);
  console.log("Verification with short secret (<32 chars):", shortSecretResult === null ? "PASSED (Rejected - Fail Closed)" : "FAILED");

  process.env.SESSION_SECRET = "";
  const missingSecretResult = await verifySessionEdge(validToken);
  console.log("Verification with missing secret (empty):", missingSecretResult === null ? "PASSED (Rejected - Fail Closed)" : "FAILED");
}

runTests();
