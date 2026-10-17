import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { isSuperAdminUser } from "@/lib/auth/admin-guard";
import { logSecurityAudit } from "@/lib/security/audit";
import { sendPasswordResetEmail } from "@/lib/email/system-mailer";
import { createPasswordResetToken } from "@/lib/auth/password-reset-token";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || !isSuperAdminUser(session.email, session.role)) {
      return NextResponse.json(
        { error: "Access denied. Administrator privileges required." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Generate secure 6-digit recovery code and recovery token
    const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetToken = createPasswordResetToken(user.email, recoveryCode);

    // Send recovery email via high-deliverability system mailer
    const emailSent = await sendPasswordResetEmail({ email: user.email }, recoveryCode);

    logSecurityAudit("ADMIN_TRIGGERED_PASSWORD_RESET", session.userId, {
      targetUserId: user.id,
      targetEmail: user.email,
      emailSent,
    });

    return NextResponse.json({
      success: true,
      message: `Password reset verification code dispatched to ${user.email}.`,
      recoveryCode,
      resetToken,
    });
  } catch (error: any) {
    console.error("Admin send-reset error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to dispatch password reset code." },
      { status: 500 }
    );
  }
}
