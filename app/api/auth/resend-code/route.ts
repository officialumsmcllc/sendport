// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// Resend Email Verification Code Handler
// ==============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { sendEmailVerificationEmail } from "@/lib/email/system-mailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required to resend verification code." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address. Please register first." },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json({
        success: true,
        alreadyVerified: true,
        message: "Your email address is already verified. You can log in directly.",
      });
    }

    // Generate fresh 6-digit code with 30-min expiry
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: newCode,
        verificationExpires: expiresAt,
      },
    });

    // Send high-speed transactional verification email
    sendEmailVerificationEmail({ email: user.email, name: user.name }, newCode).catch((err) =>
      console.warn("Async resend verification email error:", err)
    );

    const isDev = process.env.NODE_ENV !== "production" || !process.env.SMTP_USER;

    return NextResponse.json({
      success: true,
      message: `A new 6-digit verification code has been sent to ${user.email}.`,
      verificationCode: isDev ? newCode : undefined,
    });
  } catch (error: any) {
    console.error("Resend code error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to resend verification code." },
      { status: 500 }
    );
  }
}
