// ==============================================================
// Created & Owned by: officialum1
// Suite: umiskills
// 6-Digit Email Verification Handler
// ==============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { logSecurityAudit } from "@/lib/security/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and 6-digit verification code are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        workspaces: {
          include: { workspace: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address." },
        { status: 404 }
      );
    }

    // If already verified, allow login
    if (user.emailVerified) {
      const token = createSessionToken({
        userId: user.id,
        email: user.email,
        name: user.name || undefined,
        role: user.role,
      });

      const response = NextResponse.json({
        success: true,
        message: "Email is already verified. Logging you in...",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: true,
        },
      });

      response.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
      });

      return response;
    }

    // Check code match
    if (!user.verificationCode || user.verificationCode !== cleanCode) {
      return NextResponse.json(
        { error: "Invalid verification code. Please check your email or request a new code." },
        { status: 400 }
      );
    }

    // Check code expiry
    if (user.verificationExpires && new Date(user.verificationExpires) < new Date()) {
      return NextResponse.json(
        { error: "Verification code has expired. Please click 'Resend Code' to receive a new one." },
        { status: 400 }
      );
    }

    // Mark email as verified and clear code
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationExpires: null,
      },
    });

    logSecurityAudit("EMAIL_VERIFICATION_SUCCESS", user.id, {
      email: user.email,
    });

    // Send welcome onboarding email now that email address is verified
    import("@/lib/email/system-mailer")
      .then(({ sendWelcomeEmail }) =>
        sendWelcomeEmail({ email: updatedUser.email, name: updatedUser.name })
      )
      .catch((err) => console.warn("Async welcome email error:", err));

    // Create active session token
    const token = createSessionToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name || undefined,
      role: updatedUser.role,
    });

    const primaryWorkspace = user.workspaces?.[0]?.workspace;

    const response = NextResponse.json({
      success: true,
      message: "Email address verified successfully! Welcome to Sendport.",
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        emailVerified: true,
        workspaceId: primaryWorkspace?.id,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify email address. Please try again." },
      { status: 500 }
    );
  }
}
