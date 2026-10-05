import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { logSecurityAudit } from "@/lib/security/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, newPassword, confirmPassword } = body;

    if (!email || !newPassword) {
      return NextResponse.json(
        { error: "Email and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "Passwords do not match." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User account not found." },
        { status: 404 }
      );
    }

    const newHash = hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    logSecurityAudit("PASSWORD_RESET_SUCCESS", user.id, {
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      message: "Your password has been successfully reset! You can now log in.",
    });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset password." },
      { status: 500 }
    );
  }
}
