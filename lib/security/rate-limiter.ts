interface AttemptRecord {
  count: number;
  lockedUntil: number;
}

// In-memory tracker for failed login attempts
const attemptStore = new Map<string, AttemptRecord>();

// Clean up expired records every 10 minutes to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of attemptStore.entries()) {
      if (record.lockedUntil < now && record.count === 0) {
        attemptStore.delete(key);
      }
    }
  }, 10 * 60 * 1000).unref?.();
}

/**
 * Checks whether an IP or email identifier is currently rate limited.
 */
export function checkLoginRateLimit(
  key: string,
  maxAttempts = 5,
  lockDurationMs = 15 * 60 * 1000
): {
  allowed: boolean;
  remaining: number;
  retryAfterSec?: number;
} {
  const now = Date.now();
  const record = attemptStore.get(key);

  if (!record) {
    return { allowed: true, remaining: maxAttempts };
  }

  if (record.lockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec: Math.ceil((record.lockedUntil - now) / 1000),
    };
  }

  // If lock expired, reset
  if (record.lockedUntil <= now && record.lockedUntil > 0) {
    attemptStore.delete(key);
    return { allowed: true, remaining: maxAttempts };
  }

  return {
    allowed: true,
    remaining: Math.max(0, maxAttempts - record.count),
  };
}

/**
 * Records a failed attempt for an IP or email.
 */
export function recordFailedLogin(
  key: string,
  maxAttempts = 5,
  lockDurationMs = 15 * 60 * 1000
): { isLocked: boolean; remaining: number } {
  const now = Date.now();
  const record = attemptStore.get(key) || { count: 0, lockedUntil: 0 };

  record.count += 1;

  if (record.count >= maxAttempts) {
    record.lockedUntil = now + lockDurationMs;
    attemptStore.set(key, record);
    return { isLocked: true, remaining: 0 };
  }

  attemptStore.set(key, record);
  return { isLocked: false, remaining: maxAttempts - record.count };
}

/**
 * Resets the failure counter upon successful login.
 */
export function resetLoginAttempts(key: string) {
  attemptStore.delete(key);
}
