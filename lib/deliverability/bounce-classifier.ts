// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// ==============================================================

export type BounceType = "HARD" | "SOFT" | "COMPLAINT" | "NONE";

export interface BounceAnalysis {
  type: BounceType;
  shouldSuppress: boolean;
  canRetry: boolean;
  reason: string;
}

/**
 * Classifies DSN bounce response codes and error strings (RFC-3463).
 * Accurately distinguishes between true non-existent mailboxes (Hard Bounce)
 * and sender policy/authentication/reputation rejections (Spam/Policy).
 */
export function classifyBounce(smtpStatusCode?: number, errorMessage?: string): BounceAnalysis {
  const msg = (errorMessage || "").toLowerCase();
  const code = smtpStatusCode || 0;

  // 1. Policy, Authentication (SPF/DKIM/DMARC), PTR, IP Reputation or Spam Filters
  // CRITICAL: The recipient's mailbox is completely active; do NOT suppress their email address!
  if (
    msg.includes("5.7.") ||
    msg.includes("spf") ||
    msg.includes("dkim") ||
    msg.includes("dmarc") ||
    msg.includes("ptr") ||
    msg.includes("reverse dns") ||
    msg.includes("spamhaus") ||
    msg.includes("blocked") ||
    msg.includes("blacklisted") ||
    msg.includes("abuse") ||
    msg.includes("reputation") ||
    msg.includes("unsolicited")
  ) {
    return {
      type: "COMPLAINT",
      shouldSuppress: false, // Active mailbox; deliverability issue is on sender configuration/IP
      canRetry: true,
      reason: "Message rejected by destination security/reputation policy (SPF/DKIM/DMARC or IP reputation). Recipient mailbox exists.",
    };
  }

  // 2. 5xx Permanent Failures (True Hard Bounces: Mailbox does not exist)
  if (
    msg.includes("5.1.1") ||
    msg.includes("nosuchuser") ||
    msg.includes("no such user") ||
    msg.includes("user unknown") ||
    msg.includes("mailbox unavailable") ||
    msg.includes("mailbox not found") ||
    msg.includes("recipient not found") ||
    msg.includes("address rejected") ||
    msg.includes("does not exist") ||
    (code === 550 && !msg.includes("5.7."))
  ) {
    return {
      type: "HARD",
      shouldSuppress: true,
      canRetry: false,
      reason: "Mailbox does not exist (Hard Bounce). Address auto-suppressed to protect sender reputation.",
    };
  }

  // 3. 4xx Temporary Failures (Soft Bounces: Mailbox full, rate limiting, temporary deferral)
  if (
    (code >= 400 && code < 500) ||
    msg.includes("mailbox full") ||
    msg.includes("quota exceeded") ||
    msg.includes("temporarily deferred") ||
    msg.includes("try again later") ||
    msg.includes("rate limit") ||
    msg.includes("greylisted")
  ) {
    return {
      type: "SOFT",
      shouldSuppress: false,
      canRetry: true,
      reason: "Recipient inbox is temporarily full or rate-limited (Soft Bounce). Scheduled for automatic retry.",
    };
  }

  return {
    type: "NONE",
    shouldSuppress: false,
    canRetry: false,
    reason: "No bounce detected.",
  };
}
