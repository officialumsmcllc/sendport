// Common disposable email domains to block
const DISPOSABLE_DOMAINS = new Set([
  "tempmail.com", "throwawaymail.com", "mailinator.com", "guerrillamail.com",
  "sharklasers.com", "yopmail.com", "10minutemail.com", "trashmail.com",
  "dispostable.com", "fakeinbox.com", "getairmail.com", "mohmal.com"
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
 */
export async function validateEmailWithMx(email: string): Promise<EmailValidationResult> {
  const base = validateEmailAddress(email);
  if (!base.isValid) return base;

  try {
    const dns = await import("dns/promises");
    const records = await dns.resolveMx(base.domain);
    if (!records || records.length === 0) {
      return {
        email: base.email,
        isValid: false,
        isDisposable: false,
        domain: base.domain,
        reason: `Domain '${base.domain}' has no active Mail Exchange (MX) records.`,
      };
    }
  } catch (err: any) {
    return {
      email: base.email,
      isValid: false,
      isDisposable: false,
      domain: base.domain,
      reason: `Domain '${base.domain}' does not exist or has no reachable mail servers.`,
    };
  }

  return base;
}
