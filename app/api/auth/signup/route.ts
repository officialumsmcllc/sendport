import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = hashPassword(password);

    // Create user and default workspace
    const user = await prisma.user.create({
      data: {
        name: name?.trim() || normalizedEmail.split("@")[0],
        email: normalizedEmail,
        passwordHash,
        role: "USER",
      },
    });

    const slug = `workspace-${normalizedEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "")}-${Date.now().toString(36)}`;
    const workspace = await prisma.workspace.create({
      data: {
        name: `${user.name}'s Workspace`,
        slug,
        plan: "STARTER",
        dailyQuota: 500,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });

    // Create session token
    const token = createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name || undefined,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      message: "Account created successfully! Welcome to Sendport.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        workspaceId: workspace.id,
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
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
