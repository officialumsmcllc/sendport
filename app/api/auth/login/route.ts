import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { logSecurityAudit } from "@/lib/security/audit";
import {
  checkLoginRateLimit,
  recordFailedLogin,
  resetLoginAttempts,
} from "@/lib/security/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    // 1. IP-level brute force rate check
    const ipLimit = checkLoginRateLimit(`ip:${ip}`);
    if (!ipLimit.allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts from this IP address. Please wait ${ipLimit.retryAfterSec} seconds before trying again.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(ipLimit.retryAfterSec || 60) },
        }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required to log in." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Email-level account lockout check
    const emailLimit = checkLoginRateLimit(`email:${normalizedEmail}`);
    if (!emailLimit.allowed) {
      return NextResponse.json(
        {
          error: `Account temporarily locked due to repeated failed login attempts. Please wait ${emailLimit.retryAfterSec} seconds or reset your password.`,
        },
        {
          status: 429,
          headers: { "Retry-After": String(emailLimit.retryAfterSec || 60) },
        }
      );
    }

    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      recordFailedLogin(`ip:${ip}`);
      recordFailedLogin(`email:${normalizedEmail}`);
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
      recordFailedLogin(`ip:${ip}`);
      const failStatus = recordFailedLogin(`email:${normalizedEmail}`);
      const remainingMsg =
        failStatus.remaining > 0
          ? ` (${failStatus.remaining} attempts remaining before temporary lockout)`
          : "";

      return NextResponse.json(
        {
          error: `Incorrect password. Please verify your credentials or click 'Forgot Password'.${remainingMsg}`,
        },
        { status: 401 }
      );
    }

    // Reset failure counter on successful credentials
    resetLoginAttempts(`ip:${ip}`);
    resetLoginAttempts(`email:${normalizedEmail}`);

    // Generate session token
    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role,
    });

    logSecurityAudit("USER_LOGIN_SUCCESS", user.id, {
      email: user.email,
      ip,
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
