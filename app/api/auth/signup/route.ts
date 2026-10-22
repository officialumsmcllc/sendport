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

    // Generate secure 6-digit email verification code with 30-minute validity
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 30 * 60 * 1000);

    if (existingUser) {
      // If user exists AND has an active workspace membership
      if (existingUser.workspaces && existingUser.workspaces.length > 0) {
        // If they already exist but never verified, resend code and require verification
        if (!existingUser.emailVerified) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              passwordHash,
              verificationCode,
              verificationExpires,
            },
          });

          import("@/lib/email/system-mailer")
            .then(({ sendEmailVerificationEmail }) =>
              sendEmailVerificationEmail({ email: existingUser.email, name: existingUser.name }, verificationCode)
            )
            .catch((err) => console.warn("Async verification email error:", err));

          return NextResponse.json({
            success: true,
            requireVerification: true,
            email: existingUser.email,
            message: `A fresh 6-digit verification code has been sent to ${existingUser.email}. Please verify your account.`,
            verificationCode: process.env.NODE_ENV !== "production" || !process.env.SMTP_USER ? verificationCode : undefined,
          });
        }

        return NextResponse.json(
          { error: "An account with this email already exists. Please log in." },
          { status: 409 }
        );
      }

      // If user exists BUT has no workspaces, recover and complete setup
      user = await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          name: name?.trim() || existingUser.name,
          passwordHash,
          role: assignedRole,
          emailVerified: false,
          verificationCode,
          verificationExpires,
        },
        include: { workspaces: true },
      });
    } else {
      // Create fresh user with pending verification
      user = await prisma.user.create({
        data: {
          name: name?.trim() || normalizedEmail.split("@")[0],
          email: normalizedEmail,
          passwordHash,
          role: assignedRole,
          emailVerified: false,
          verificationCode,
          verificationExpires,
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

    // Send 6-Digit Verification Code Email asynchronously from no-reply@getsendport.com
    import("@/lib/email/system-mailer")
      .then(({ sendEmailVerificationEmail }) =>
        sendEmailVerificationEmail({ email: user.email, name: user.name }, verificationCode)
      )
      .catch((err) => console.warn("Async verification email error:", err));

    const isDev = process.env.NODE_ENV !== "production" || !process.env.SMTP_USER;

    return NextResponse.json({
      success: true,
      requireVerification: true,
      message: `A 6-digit confirmation code has been sent to ${user.email}. Please enter it below to activate your account.`,
      email: user.email,
      workspaceId,
      verificationCode: isDev ? verificationCode : undefined,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: false,
      },
    });
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
