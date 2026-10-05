export type BounceType = "HARD" | "SOFT" | "COMPLAINT" | "NONE";

export interface BounceAnalysis {
  type: BounceType;
  shouldSuppress: boolean;
  canRetry: boolean;
  reason: string;
}

/**
 * Classifies DSN bounce response codes and error strings (RFC-3463)
 */
export function classifyBounce(smtpStatusCode?: number, errorMessage?: string): BounceAnalysis {
  const msg = (errorMessage || "").toLowerCase();
  const code = smtpStatusCode || 0;

  // 5xx Permanent Failures (Hard Bounces)
  if (
    code === 550 || code === 551 || code === 553 || code === 554 ||
    msg.includes("user unknown") || msg.includes("no such user") ||
    msg.includes("mailbox unavailable") || msg.includes("recipient rejected") ||
    msg.includes("address rejected") || msg.includes("does not exist")
  ) {
    return {
      type: "HARD",
      shouldSuppress: true,
      canRetry: false,
      reason: "Mailbox does not exist (Hard Bounce). Address auto-suppressed to protect sender reputation.",
    };
  }

  // 4xx Temporary Failures (Soft Bounces)
  if (
    code >= 400 && code < 500 ||
    msg.includes("mailbox full") || msg.includes("quota exceeded") ||
    msg.includes("temporarily deferred") || msg.includes("try again later") ||
    msg.includes("rate limit") || msg.includes("greylisted")
  ) {
    return {
      type: "SOFT",
      shouldSuppress: false,
      canRetry: true,
      reason: "Recipient inbox is temporarily full or rate-limited (Soft Bounce). Scheduled for automatic retry.",
    };
  }

  // Spam complaints / blocks
  if (msg.includes("spamhaus") || msg.includes("blocked") || msg.includes("blacklisted") || msg.includes("abuse")) {
    return {
      type: "COMPLAINT",
      shouldSuppress: true,
      canRetry: false,
      reason: "Blocked by recipient spam filter or reputation list.",
    };
  }

  return {
    type: "NONE",
    shouldSuppress: false,
    canRetry: false,
    reason: "No bounce detected.",
  };
}
