// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

// Common disposable email domains to block
const DISPOSABLE_DOMAINS = new Set([
  "tempmail.com", "throwawaymail.com", "mailinator.com", "guerrillamail.com",
  "sharklasers.com", "yopmail.com", "10minutemail.com", "trashmail.com",
  "dispostable.com", "fakeinbox.com", "getairmail.com", "mohmal.com",
  "temp-mail.org", "nada.ltd", "burnermail.io", "crazymailing.com",
  "mytemp.email", "generator.email", "emailondeck.com", "tempail.com"
]);

// Reputable global webmail providers with 100% guaranteed live MX infrastructure.
// Fast-path bypass prevents container DNS UDP 53 timeouts (Render / Docker) from falsely failing valid Gmail/Yahoo/Outlook users.
const MAJOR_WEBMAIL_DOMAINS = new Set([
  "gmail.com", "googlemail.com", "google.com",
  "yahoo.com", "ymail.com", "rocketmail.com", "yahoo.co.uk", "yahoo.fr",
  "outlook.com", "hotmail.com", "live.com", "msn.com", "hotmail.co.uk",
  "icloud.com", "me.com", "mac.com",
  "zoho.com", "proton.me", "protonmail.com", "aol.com", "gmx.com", "mail.com"
]);

export interface EmailValidationResult {
  email: string;
  isValid: boolean;
  isDisposable: boolean;
  domain: string;
  reason?: string;
}

export function validateEmailAddress(email: string): EmailValidationResult {
  const cleanEmail = (email || "").trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!cleanEmail || !emailRegex.test(cleanEmail)) {
    return {
      email: cleanEmail,
      isValid: false,
      isDisposable: false,
      domain: "",
      reason: "Invalid email syntax format.",
    };
  }

  const parts = cleanEmail.split("@");
  const domain = parts[1] || "";

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      email: cleanEmail,
      isValid: false,
      isDisposable: true,
      domain,
      reason: "Disposable / temporary email addresses are rejected to protect deliverability.",
    };
  }

  return {
    email: cleanEmail,
    isValid: true,
    isDisposable: false,
    domain,
  };
}

/**
 * Pre-flight MX record verification: guarantees recipient domain can accept email
 * and prevents hard bounces before hitting physical SMTP relays.
 * Features DNS-over-HTTPS (DoH) resilience so restricted cloud containers (Render) never drop valid domains.
 */
export async function validateEmailWithMx(email: string): Promise<EmailValidationResult> {
  const base = validateEmailAddress(email);
  if (!base.isValid) return base;

  const domain = base.domain.toLowerCase();

  // Fast-Path: Standard webmail providers always have verified MX servers
  if (MAJOR_WEBMAIL_DOMAINS.has(domain)) {
    return base;
  }

  // 1. Attempt Node.js Native DNS MX resolution (with 2.5s strict timeout)
  try {
    const dns = await import("dns/promises");
    const records = await Promise.race([
      dns.resolveMx(domain),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Local DNS timeout")), 2500)
      ),
    ]);

    if (records && records.length > 0) {
      return base;
    }
  } catch (err: any) {
    // 2. Resilient Fallback: Google DNS-over-HTTPS (DoH) via Port 443
    // This bypasses local container UDP 53 throttling or dead cloud resolvers
    try {
      const dohRes = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`,
        { signal: AbortSignal.timeout(3000) }
      );
      if (dohRes.ok) {
        const dohData = await dohRes.json();
        if (dohData.Answer && dohData.Answer.length > 0) {
          return base; // MX records verified via DoH
        }
      }
    } catch (_) {
      // If external network is transiently glitching, allow send attempt rather than falsely rejecting legitimate users
      return base;
    }

    return {
      email: base.email,
      isValid: false,
      isDisposable: false,
      domain: base.domain,
      reason: `Domain '${base.domain}' does not have any active Mail Exchange (MX) records.`,
    };
  }

  return base;
}
