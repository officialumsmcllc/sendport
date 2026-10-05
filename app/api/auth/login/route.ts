import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { logSecurityAudit } from "@/lib/security/audit";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required to log in." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            "No account found with this email. You cannot log in without registering first. Please create an account.",
        },
        { status: 401 }
      );
    }

    // Verify password
    if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: "Incorrect password. Please verify your credentials or click 'Forgot Password'." },
        { status: 401 }
      );
    }

    // Generate session token
    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role,
    });

    logSecurityAudit("USER_LOGIN_SUCCESS", user.id, {
      email: user.email,
      ip: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    const response = NextResponse.json({
      success: true,
      message: "Logged in successfully!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to log in. Please try again." },
      { status: 500 }
    );
  }
}
