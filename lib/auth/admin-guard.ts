/**
 * Centralized Admin Authorization & Privilege Guard
 * Ensures super admins (including owner accounts) are recognized consistently across:
 * - Next.js Middleware (Edge runtime)
 * - Server Components (SSR)
 * - Route Handlers (API)
 * - Client-side state managers
 */

export const DEFAULT_SUPER_ADMIN_EMAILS: string[] = [
  "admin@getsendport.com",
  "umar.mumtaz37@yahoo.com",
];

/**
 * Checks whether an email belongs to a designated super admin.
 */
export function isSuperAdminEmail(email?: string | null): boolean {
  if (!email || typeof email !== "string") return false;
  const normalized = email.toLowerCase().trim();

  // Check default master emails
  if (DEFAULT_SUPER_ADMIN_EMAILS.includes(normalized)) return true;

  // Check official company domain emails
  if (normalized.endsWith("@getsendport.com")) return true;

  // Check environment-configured admin emails (comma-separated list)
  const envAdmins = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(",").map((e) => e.toLowerCase().trim())
    : [];

  return envAdmins.includes(normalized);
}

/**
 * Checks whether a user has administrative privileges based on either their role or email.
 */
export function isSuperAdminUser(email?: string | null, role?: string | null): boolean {
  if (role === "ADMIN") return true;
  return isSuperAdminEmail(email);
}
