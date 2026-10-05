import { prisma } from "@/lib/db/prisma";

export async function logSecurityAudit(
  action: string,
  userId?: string,
  details?: Record<string, any>,
  ip?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        userId: userId || null,
        details: details ? JSON.stringify(details) : null,
        ip: ip || null,
      },
    });
  } catch (error) {
    console.error("Audit log error:", error);
  }
}
