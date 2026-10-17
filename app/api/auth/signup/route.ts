import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { isSuperAdminEmail } from "@/lib/auth/admin-guard";
import { ensureDbSchema } from "@/lib/db/ensure-schema";

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

    // Ensure database columns (like credits) exist in PostgreSQL
    await ensureDbSchema();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        workspaces: true,
      },
    });

    const passwordHash = hashPassword(password);
    const isAdmin = isSuperAdminEmail(normalizedEmail);
    const assignedRole = isAdmin ? "ADMIN" : "USER";
    const assignedPlan = isAdmin ? "SCALE_PRO" : "STARTER";
    const assignedQuota = isAdmin ? 50000 : 100;

    let user = existingUser;
    let workspaceId: string | undefined;

    if (existingUser) {
      // If user exists AND has an active workspace membership, require them to log in
      if (existingUser.workspaces && existingUser.workspaces.length > 0) {
        return NextResponse.json(
          { error: "An account with this email already exists. Please log in." },
          { status: 409 }
        );
      }

      // If user exists BUT has no workspaces (due to previous aborted creation), recover and complete setup
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: name?.trim() || existingUser.name,
          passwordHash,
          role: assignedRole,
        },
        include: { workspaces: true },
      });
    } else {
      // Create fresh user
      user = await prisma.user.create({
        data: {
          name: name?.trim() || normalizedEmail.split("@")[0],
          email: normalizedEmail,
          passwordHash,
          role: assignedRole,
        },
        include: { workspaces: true },
      });
    }

    // Now provision default workspace if none attached
    const slug = `workspace-${normalizedEmail.split("@")[0].replace(/[^a-zA-Z0-9]/g, "")}-${Date.now().toString(36)}`;
    const workspace = await prisma.workspace.create({
      data: {
        name: `${user.name || "My"}'s Workspace`,
        slug,
        plan: assignedPlan,
        dailyQuota: assignedQuota,
        credits: 0,
        members: {
          create: {
            userId: user.id,
            role: "OWNER",
          },
        },
      },
    });
    workspaceId = workspace.id;

    // Send Welcome Email asynchronously from no-reply@getsendport.com
    import("@/lib/email/system-mailer")
      .then(({ sendWelcomeEmail }) => sendWelcomeEmail({ email: user.email, name: user.name }))
      .catch((err) => console.warn("Async welcome email error:", err));

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
        workspaceId,
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
